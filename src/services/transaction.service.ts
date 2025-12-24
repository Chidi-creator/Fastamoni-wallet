import TransactionUseCase from "@usecases/transaction.usecase";
import DonationUseCase from "@usecases/donation.usecase";
import PaymentIntentUseCase from "@usecases/paymentIntent.usecase";
import UserUseCase from "@usecases/user.usecase";
import WalletUsecase from "@usecases/wallet.usecase";
import { CreditWalletPayload, WithdrawToAccountPayload } from "./types/wallet";
import { BadRequestError, NotFoundError, UnauthorizedError } from "@managers/error.manager";
import logger from "@services/logger.service";
import { TransactionStatus } from "@config/constants";
import FlutterwavePaymentProvider from "@providers/payments/flutterwave";
import { env } from "@config/env";
import { Prisma } from "@prisma/client";
import MailService from "@services/mail.service";

class TransactionService {
  walletUsecase: WalletUsecase;
  userUsecase: UserUseCase;
  transactionUsecase: TransactionUseCase;
  donationUsecase: DonationUseCase;
  paymentIntentUseCase: PaymentIntentUseCase;
  paymentProvider: FlutterwavePaymentProvider;
  mailService: MailService;

  constructor() {
    this.walletUsecase = new WalletUsecase();
    this.userUsecase = new UserUseCase();
    this.transactionUsecase = new TransactionUseCase();
    this.donationUsecase = new DonationUseCase();
    this.paymentIntentUseCase = new PaymentIntentUseCase();
    this.paymentProvider = FlutterwavePaymentProvider.getInstance();
    this.mailService = new MailService();
  }

  // Wallet-to-wallet transfer that also creates a donation + transaction record with idempotency support.
  async handleDonationTransfer(
    payload: CreditWalletPayload,
    donorUserId: string,
    idempotencyKey?: string
  ): Promise<{ donationId: string; transactionId: string; idempotencyKey: string }> {
    logger.info(`Starting donation transfer for user ${donorUserId}`, {
      donorUserId,
      accountNumber: payload.account_number,
      amount: payload.amount,
    });

    const key = idempotencyKey || this.generateIdempotencyKey();

    // Idempotency: if a transaction already exists for this key, short-circuit.
    if (idempotencyKey) {
      const existingTxn = await this.transactionUsecase.getByIdempotencyKey(idempotencyKey);
      if (existingTxn) {
        return {
          donationId: existingTxn.donationId,
          transactionId: existingTxn.id,
          idempotencyKey: existingTxn.idempotencyKey,
        };
      }
    }

    const senderWallet = await this.walletUsecase.getWalletByUserId(donorUserId);
    if (!senderWallet) {
      throw new NotFoundError(`Wallet not found for user ID: ${donorUserId}`);
    }

    if (payload.currency !== "NGN") {
      throw new BadRequestError(`Unsupported currency: ${payload.currency}`);
    }

    const receiverWallet = await this.walletUsecase.getWalletByAccountNumber(
      payload.account_number
    );
    if (!receiverWallet) {
      throw new NotFoundError(
        `Receiver wallet not found for account number: ${payload.account_number}`
      );
    }

    if (senderWallet.id === receiverWallet.id) {
      throw new BadRequestError("Cannot transfer to your own wallet");
    }

    const amount = Number(payload.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new BadRequestError("Invalid transfer amount");
    }

    // Perform atomic transfer (checks balance inside).
    await this.transactionUsecase.handleInternalWalletTransfer(
      senderWallet.id,
      receiverWallet.id,
      amount
    );

    // Create donation record.
    const donation = await this.donationUsecase.createDonation({
      donorId: donorUserId,
      beneficiaryId: receiverWallet.userId,
      amount,
    });

    // Create transaction record linked to donation.
    const transaction = await this.transactionUsecase.createTransaction({
      donationId: donation.id,
      idempotencyKey: key,
      status: TransactionStatus.COMPLETED,
    });

    logger.info("Donation transfer completed", {
      donorUserId,
      beneficiaryUserId: receiverWallet.userId,
      amount,
      donationId: donation.id,
      transactionId: transaction.id,
      idempotencyKey: key,
    });

    // Check if user has made 2 or more donations and send thank you email if not already sent
    const donationCount = await this.donationUsecase.countDonationsByDonor(donorUserId);
    const donor = await this.userUsecase.getUserById(donorUserId);
    if (donationCount >= 2 && donor && !donor.thanked) {
      try {
        await this.mailService.sendMail({
          to: donor.email,
          subject: "Thank You for Your Generous Donations!",
          text: `Dear ${donor.firstname},\n\nThank you for making ${donationCount} donations through our platform. Your continued support means a lot to us and helps make a difference.\n\nBest regards,\nFastamoni Team`,
          html: `<p>Dear ${donor.firstname},</p><p>Thank you for making <strong>${donationCount}</strong> donations through our platform. Your continued support means a lot to us and helps make a difference.</p><p>Best regards,<br>Fastamoni Team</p>`
        });
        await this.userUsecase.setThanked(donorUserId, true);
        logger.info("Thank you email sent to donor", { donorUserId, donationCount });
      } catch (error) {
        logger.error("Failed to send thank you email", { donorUserId, error });
      }
    }

    return {
      donationId: donation.id,
      transactionId: transaction.id,
      idempotencyKey: key,
    };
  }

  // Initiate a bank transfer through Flutterwave; funds are reserved immediately and refunded on failure via webhook.
  async initiateBankTransfer(
    payload: WithdrawToAccountPayload,
    userId: string,
    idempotencyKey?: string
  ): Promise<{ transferId?: number; reference: string; status: string; idempotencyKey: string }> {
    const key = idempotencyKey || this.generateIdempotencyKey();

    if (idempotencyKey) {
      const existing = await this.paymentIntentUseCase.findByIdempotencyKey(idempotencyKey);
      if (existing) {
        const raw = (existing.rawResponse as any) || {};
        const transferId = raw?.data?.id || raw?.id;
        return {
          transferId,
          reference: existing.reference,
          status: existing.status,
          idempotencyKey: existing.idempotencyKey,
        };
      }
    }

    const wallet = await this.walletUsecase.getWalletByUserId(userId);
    if (!wallet) {
      throw new NotFoundError(`Wallet not found for user ID: ${userId}`);
    }

    if (payload.currency !== "NGN") {
      throw new BadRequestError(`Unsupported currency: ${payload.currency}`);
    }

    const amount = Number(payload.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new BadRequestError("Invalid transfer amount");
    }

    if (wallet.balance < amount) {
      throw new BadRequestError("Insufficient wallet balance");
    }

    const reference = this.generateTransferRef(userId);

    const transferResponse = await this.paymentProvider.initiateTransfer({
      account_bank: payload.bank_code,
      account_number: payload.account_number,
      amount,
      currency: payload.currency,
      debit_currency: payload.debit_currency || payload.currency,
      destination_branch_code: payload.destination_branch_code,
      callback_url: payload.callback_url,
      narration: payload.narration,
      reference,
      meta: payload.meta,
    });

    if (transferResponse.status !== "success") {
      throw new BadRequestError(
        `Flutterwave transfer could not be queued: ${transferResponse.message}`
      );
    }

    const transferReference = transferResponse.data?.reference || reference;

    // Reserve funds; webhook will refund on failure.
    logger.info("Reserving funds for bank transfer", {
      userId,
      walletId: wallet.id,
      amount,
      reference: transferReference,
    });
    await this.walletUsecase.updateWallet(wallet.id, {
      balance: { decrement: amount },
    });

    await this.paymentIntentUseCase.create({
      userId,
      walletId: wallet.id,
      amount,
      currency: payload.currency,
      reference: transferReference,
      idempotencyKey: key,
      status: TransactionStatus.PENDING,
      provider: "flutterwave-transfer",
      rawResponse: transferResponse as unknown as Prisma.InputJsonValue,
    });

    const transferId = transferResponse.data?.id;

    return {
      transferId,
      reference: transferReference,
      status: TransactionStatus.PENDING,
      idempotencyKey: key,
    };
  }

  async getDonationCount(userId: string): Promise<number> {
    return this.donationUsecase.countDonationsByDonor(userId);
  }

  // Handle Flutterwave webhook; routes to payment or transfer handlers.
  async handleFlutterwaveWebhook(body: any, headers: Record<string, any>): Promise<void> {
    const sig = headers["verif-hash"] as string | undefined;
    if (!sig || sig !== env.FLUTTERWAVE_WEBHOOK_SECRET) {
      throw new UnauthorizedError("Invalid webhook signature");
    }

    logger.info("Raw Flutterwave webhook received", {
      event: body?.event,
      data: body?.data,
    });

    const eventType = (body?.event as string | undefined)?.toLowerCase();
    const data = body?.data || {};
    const looksLikeTransfer =
      eventType?.includes("transfer") || (!!data.reference && !data.tx_ref);

    if (looksLikeTransfer) {
      logger.info("Routing Flutterwave webhook to transfer handler", { eventType, reference: data?.reference });
      await this.handleTransferWebhook(body);
      return;
    }

    logger.info("Routing Flutterwave webhook to payment handler", { eventType, tx_ref: data?.tx_ref });
    await this.handlePaymentWebhook(body);
  }

  private async handlePaymentWebhook(event: any): Promise<void> {
    const data = event?.data;
    const status = data?.status as string | undefined;
    const reference =
      (data?.tx_ref as string | undefined) ||
      (data?.reference as string | undefined) ||
      (data?.id ? String(data.id) : undefined);
    const amount = Number(data?.amount);

    logger.info("Received Flutterwave payment webhook", {
      eventType: event?.event,
      tx_ref: data?.tx_ref,
      reference,
      account_number: data?.account_number,
      amount,
      currency: data?.currency,
      status,
    });

    if (!reference) {
      logger.warn("Payment webhook missing reference; generating fallback");
    }

    if (isNaN(amount)) {
      logger.warn("Payment webhook missing amount", { reference });
      return;
    }

    const effectiveReference = (reference || this.generateTxRef("webhook")) + "-" + Date.now();
    const intent = await this.paymentIntentUseCase.findByReference(effectiveReference);

    if (!intent) {
      // Always use customer email to map user and wallet for deposits.
      const customerEmail = data?.customer?.email as string | undefined;

      if (!customerEmail) {
        logger.warn("No customer email in webhook for deposit mapping", {
          reference: effectiveReference,
          tx_ref: data?.tx_ref,
          rawKeys: Object.keys(data || {}),
        });
        return;
      }

      const user = await this.userUsecase.getUserByEmail(customerEmail);
      if (!user) {
        logger.warn("User not found for incoming credit via email", { email: customerEmail });
        return;
      }

      const wallet = await this.walletUsecase.getWalletByUserId(user.id);
      if (!wallet) {
        logger.warn("Wallet not found for user when crediting via email", { userId: user.id, email: customerEmail });
        return;
      }

      // Check for duplicate payment intent to prevent double-crediting
      const existingIntent = await this.paymentIntentUseCase.findByReference(effectiveReference);
      if (existingIntent) {
        logger.warn("Duplicate webhook for reference; skipping credit", {
          reference: effectiveReference,
          userId: user.id,
          walletId: wallet.id,
        });
        return;
      }

      logger.info("Crediting wallet from webhook (email mapping ONLY)", {
        walletId: wallet.id,
        userId: wallet.userId,
        amount,
        email: customerEmail,
        reference: effectiveReference,
      });

      await this.walletUsecase.updateWallet(wallet.id, {
        balance: { increment: amount },
      });

      await this.paymentIntentUseCase.create({
        userId: wallet.userId,
        walletId: wallet.id,
        amount,
        currency: (data?.currency as string | undefined) || wallet.currency,
        reference: effectiveReference,
        idempotencyKey: `FW-WH-${effectiveReference}`,
        status: TransactionStatus.COMPLETED,
        provider: "flutterwave-payment",
        rawResponse: event as unknown as Prisma.InputJsonValue,
      });

      return;
    }

    if (intent.provider === "flutterwave-transfer") {
      logger.warn("Received payment webhook for transfer intent", { reference: effectiveReference });
      return;
    }

    if (intent.status === TransactionStatus.COMPLETED || intent.status === TransactionStatus.FAILED) {
      logger.info("Payment intent already processed", {
        intentId: intent.id,
        status: intent.status,
        reference: effectiveReference,
      });
      return;
    }

    if ((status || "").toLowerCase() === "successful") {
      logger.info("Crediting wallet for successful payment intent", {
        walletId: intent.walletId,
        intentId: intent.id,
        amount,
        reference: effectiveReference,
      });
      await this.walletUsecase.updateWallet(intent.walletId, {
        balance: { increment: amount },
      });

      await this.paymentIntentUseCase.updateStatusAndRaw(
        intent.id,
        TransactionStatus.COMPLETED,
        event
      );
    } else if ((status || "").toLowerCase() === "failed") {
      logger.warn("Payment webhook marked as failed", {
        intentId: intent.id,
        reference: effectiveReference,
        status,
      });
      await this.paymentIntentUseCase.updateStatusAndRaw(
        intent.id,
        TransactionStatus.FAILED,
        event
      );
    } else {
      await this.paymentIntentUseCase.updateStatusAndRaw(
        intent.id,
        TransactionStatus.PENDING,
        event
      );
    }
  }

  private async handleTransferWebhook(event: any): Promise<void> {
    const data = event?.data;
    const status = (data?.status as string | undefined) || "";
    const reference = data?.reference as string | undefined;

    if (!reference) {
      logger.warn("Transfer webhook missing reference");
      return;
    }

    const intent = await this.paymentIntentUseCase.findByReference(reference);
    if (!intent) {
      logger.warn("Transfer intent not found for reference", { reference });
      return;
    }

    if (intent.provider !== "flutterwave-transfer") {
      logger.warn("Received transfer webhook for non-transfer intent", { reference, provider: intent.provider });
      return;
    }

    if (intent.status === TransactionStatus.COMPLETED || intent.status === TransactionStatus.FAILED) {
      return;
    }

    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "successful" || normalizedStatus === "success") {
      logger.info("Transfer webhook marked successful", {
        intentId: intent.id,
        walletId: intent.walletId,
        reference,
      });
      await this.paymentIntentUseCase.updateStatusAndRaw(
        intent.id,
        TransactionStatus.COMPLETED,
        event
      );
    } else if (
      normalizedStatus === "failed" ||
      normalizedStatus === "reversed" ||
      normalizedStatus === "cancelled"
    ) {
      // Refund reserved funds on failure.
      logger.warn("Transfer webhook failed; refunding reserved funds", {
        intentId: intent.id,
        walletId: intent.walletId,
        amount: intent.amount,
        reference,
        status,
      });
      await this.walletUsecase.updateWallet(intent.walletId, {
        balance: { increment: intent.amount },
      });

      await this.paymentIntentUseCase.updateStatusAndRaw(
        intent.id,
        TransactionStatus.FAILED,
        event
      );
    } else {
      logger.info("Transfer webhook pending/other status", {
        intentId: intent.id,
        reference,
        status,
      });
      await this.paymentIntentUseCase.updateStatusAndRaw(
        intent.id,
        TransactionStatus.PENDING,
        event
      );
    }
  }

  private generateIdempotencyKey(): string {
    const timestamp = Date.now();
    return `FM-IDMP-${timestamp}`;
  }

  private generateTxRef(userId: string): string {
    const timestamp = Date.now();
    return `FW-${userId}-${timestamp}`;
  }

  private generateTransferRef(userId: string): string {
    const timestamp = Date.now();
    return `FW-TRF-${userId}-${timestamp}`;
  }
}

export default TransactionService;
