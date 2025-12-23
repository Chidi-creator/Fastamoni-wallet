import TransactionUseCase from "@usecases/transaction.usecase";
import DonationUseCase from "@usecases/donation.usecase";
import PaymentIntentUseCase from "@usecases/paymentIntent.usecase";
import UserUseCase from "@usecases/user.usecase";
import WalletUsecase from "@usecases/wallet.usecase";
import { CreditWalletPayload, DepositPayload } from "./types/wallet";
import { BadRequestError, NotFoundError, UnauthorizedError } from "@managers/error.manager";
import logger from "@services/logger.service";
import { TransactionStatus } from "@config/constants";
import FlutterwavePaymentProvider from "@providers/payments/flutterwave";
import { env } from "@config/env";
import { Prisma } from "@prisma/client";

class TransactionService {
  walletUsecase: WalletUsecase;
  userUsecase: UserUseCase;
  transactionUsecase: TransactionUseCase;
  donationUsecase: DonationUseCase;
  paymentIntentUseCase: PaymentIntentUseCase;
  paymentProvider: FlutterwavePaymentProvider;

  constructor() {
    this.walletUsecase = new WalletUsecase();
    this.userUsecase = new UserUseCase();
    this.transactionUsecase = new TransactionUseCase();
    this.donationUsecase = new DonationUseCase();
    this.paymentIntentUseCase = new PaymentIntentUseCase();
    this.paymentProvider = FlutterwavePaymentProvider.getInstance();
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

    return {
      donationId: donation.id,
      transactionId: transaction.id,
      idempotencyKey: key,
    };
  }

  // Initiate a deposit via Flutterwave payments; returns payment link + references.
  async initiateDeposit(
    payload: DepositPayload,
    userId: string,
    idempotencyKey?: string
  ): Promise<{ paymentLink: string; reference: string; idempotencyKey: string }> {
    const key = idempotencyKey || this.generateIdempotencyKey();

    if (idempotencyKey) {
      const existing = await this.paymentIntentUseCase.findByIdempotencyKey(idempotencyKey);
      if (existing) {
        const storedLink =
          (existing.rawResponse as any)?.data?.link || "";
        return {
          paymentLink: storedLink,
          reference: existing.reference,
          idempotencyKey: existing.idempotencyKey,
        };
      }
    }

    const wallet = await this.walletUsecase.getWalletByUserId(userId);
    if (!wallet) {
      throw new NotFoundError(`Wallet not found for user ID: ${userId}`);
    }

    const amount = Number(payload.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new BadRequestError("Invalid deposit amount");
    }

    const reference = this.generateTxRef(userId);

    const paymentResponse = await this.paymentProvider.initiatePayment({
      tx_ref: reference,
      amount,
      currency: payload.currency,
      redirect_url: payload.redirect_url,
      narration: payload.narration,
      customer: {
        email: payload.email,
        name: payload.name,
      },
    });

    const link = paymentResponse.data?.link || "";

    await this.paymentIntentUseCase.create({
      userId,
      walletId: wallet.id,
      amount,
      currency: payload.currency,
      reference,
      idempotencyKey: key,
      status: TransactionStatus.PENDING,
      rawResponse: paymentResponse as unknown as Prisma.InputJsonValue,
    });

    return { paymentLink: link, reference, idempotencyKey: key };
  }

  // Handle Flutterwave webhook; verify signature, credit wallet, and finalize intent.
  async handleFlutterwaveWebhook(body: any, headers: Record<string, any>): Promise<void> {
    const sig = headers["verif-hash"] as string | undefined;
    if (!sig || sig !== env.FLUTTERWAVE_WEBHOOK_SECRET) {
      throw new UnauthorizedError("Invalid webhook signature");
    }

    const event = body;
    const data = event?.data;
    const status = data?.status;
    const reference = data?.tx_ref as string | undefined;
    const amount = Number(data?.amount);

    if (!reference) {
      logger.warn("Webhook missing reference");
      return;
    }

    const intent = await this.paymentIntentUseCase.findByReference(reference);
    if (!intent) {
      logger.warn("Payment intent not found for reference", { reference });
      return;
    }

    if (intent.status === TransactionStatus.COMPLETED || intent.status === TransactionStatus.FAILED) {
      return;
    }

    if (status === "successful") {
      await this.walletUsecase.updateWallet(intent.walletId, {
        balance: { increment: amount },
      });

      await this.paymentIntentUseCase.updateStatusAndRaw(
        intent.id,
        TransactionStatus.COMPLETED,
        event
      );
    } else if (status === "failed") {
      await this.paymentIntentUseCase.updateStatusAndRaw(
        intent.id,
        TransactionStatus.FAILED,
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
}

export default TransactionService;
