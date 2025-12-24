"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transaction_usecase_1 = __importDefault(require("../usecases/transaction.usecase"));
const donation_usecase_1 = __importDefault(require("../usecases/donation.usecase"));
const paymentIntent_usecase_1 = __importDefault(require("../usecases/paymentIntent.usecase"));
const user_usecase_1 = __importDefault(require("../usecases/user.usecase"));
const wallet_usecase_1 = __importDefault(require("../usecases/wallet.usecase"));
const error_manager_1 = require("../managers/error.manager");
const logger_service_1 = __importDefault(require("./logger.service"));
const constants_1 = require("../config/constants");
const flutterwave_1 = __importDefault(require("../providers/payments/flutterwave"));
const env_1 = require("../config/env");
const mail_service_1 = __importDefault(require("./mail.service"));
class TransactionService {
    constructor() {
        this.walletUsecase = new wallet_usecase_1.default();
        this.userUsecase = new user_usecase_1.default();
        this.transactionUsecase = new transaction_usecase_1.default();
        this.donationUsecase = new donation_usecase_1.default();
        this.paymentIntentUseCase = new paymentIntent_usecase_1.default();
        this.paymentProvider = flutterwave_1.default.getInstance();
        this.mailService = new mail_service_1.default();
    }
    // Wallet-to-wallet transfer that also creates a donation + transaction record with idempotency support.
    async handleDonationTransfer(payload, donorUserId, idempotencyKey) {
        logger_service_1.default.info(`Starting donation transfer for user ${donorUserId}`, {
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
            throw new error_manager_1.NotFoundError(`Wallet not found for user ID: ${donorUserId}`);
        }
        if (payload.currency !== "NGN") {
            throw new error_manager_1.BadRequestError(`Unsupported currency: ${payload.currency}`);
        }
        const receiverWallet = await this.walletUsecase.getWalletByAccountNumber(payload.account_number);
        if (!receiverWallet) {
            throw new error_manager_1.NotFoundError(`Receiver wallet not found for account number: ${payload.account_number}`);
        }
        if (senderWallet.id === receiverWallet.id) {
            throw new error_manager_1.BadRequestError("Cannot transfer to your own wallet");
        }
        const amount = Number(payload.amount);
        if (isNaN(amount) || amount <= 0) {
            throw new error_manager_1.BadRequestError("Invalid transfer amount");
        }
        // Perform atomic transfer (checks balance inside).
        await this.transactionUsecase.handleInternalWalletTransfer(senderWallet.id, receiverWallet.id, amount);
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
            status: constants_1.TransactionStatus.COMPLETED,
        });
        logger_service_1.default.info("Donation transfer completed", {
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
                logger_service_1.default.info("Thank you email sent to donor", { donorUserId, donationCount });
            }
            catch (error) {
                logger_service_1.default.error("Failed to send thank you email", { donorUserId, error });
            }
        }
        return {
            donationId: donation.id,
            transactionId: transaction.id,
            idempotencyKey: key,
        };
    }
    // Initiate a bank transfer through Flutterwave; funds are reserved immediately and refunded on failure via webhook.
    async initiateBankTransfer(payload, userId, idempotencyKey) {
        const key = idempotencyKey || this.generateIdempotencyKey();
        if (idempotencyKey) {
            const existing = await this.paymentIntentUseCase.findByIdempotencyKey(idempotencyKey);
            if (existing) {
                const raw = existing.rawResponse || {};
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
            throw new error_manager_1.NotFoundError(`Wallet not found for user ID: ${userId}`);
        }
        if (payload.currency !== "NGN") {
            throw new error_manager_1.BadRequestError(`Unsupported currency: ${payload.currency}`);
        }
        const amount = Number(payload.amount);
        if (isNaN(amount) || amount <= 0) {
            throw new error_manager_1.BadRequestError("Invalid transfer amount");
        }
        if (wallet.balance < amount) {
            throw new error_manager_1.BadRequestError("Insufficient wallet balance");
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
            throw new error_manager_1.BadRequestError(`Flutterwave transfer could not be queued: ${transferResponse.message}`);
        }
        const transferReference = transferResponse.data?.reference || reference;
        // Reserve funds; webhook will refund on failure.
        logger_service_1.default.info("Reserving funds for bank transfer", {
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
            status: constants_1.TransactionStatus.PENDING,
            provider: "flutterwave-transfer",
            rawResponse: transferResponse,
        });
        const transferId = transferResponse.data?.id;
        return {
            transferId,
            reference: transferReference,
            status: constants_1.TransactionStatus.PENDING,
            idempotencyKey: key,
        };
    }
    async getDonationCount(userId) {
        return this.donationUsecase.countDonationsByDonor(userId);
    }
    // Handle Flutterwave webhook; routes to payment or transfer handlers.
    async handleFlutterwaveWebhook(body, headers) {
        const sig = headers["verif-hash"];
        if (!sig || sig !== env_1.env.FLUTTERWAVE_WEBHOOK_SECRET) {
            throw new error_manager_1.UnauthorizedError("Invalid webhook signature");
        }
        logger_service_1.default.info("Raw Flutterwave webhook received", {
            event: body?.event,
            data: body?.data,
        });
        const eventType = body?.event?.toLowerCase();
        const data = body?.data || {};
        const looksLikeTransfer = eventType?.includes("transfer") || (!!data.reference && !data.tx_ref);
        if (looksLikeTransfer) {
            logger_service_1.default.info("Routing Flutterwave webhook to transfer handler", { eventType, reference: data?.reference });
            await this.handleTransferWebhook(body);
            return;
        }
        logger_service_1.default.info("Routing Flutterwave webhook to payment handler", { eventType, tx_ref: data?.tx_ref });
        await this.handlePaymentWebhook(body);
    }
    async handlePaymentWebhook(event) {
        const data = event?.data;
        const status = data?.status;
        const reference = data?.tx_ref ||
            data?.reference ||
            (data?.id ? String(data.id) : undefined);
        const amount = Number(data?.amount);
        logger_service_1.default.info("Received Flutterwave payment webhook", {
            eventType: event?.event,
            tx_ref: data?.tx_ref,
            reference,
            account_number: data?.account_number,
            amount,
            currency: data?.currency,
            status,
        });
        if (!reference) {
            logger_service_1.default.warn("Payment webhook missing reference; generating fallback");
        }
        if (isNaN(amount)) {
            logger_service_1.default.warn("Payment webhook missing amount", { reference });
            return;
        }
        const effectiveReference = (reference || this.generateTxRef("webhook")) + "-" + Date.now();
        const intent = await this.paymentIntentUseCase.findByReference(effectiveReference);
        if (!intent) {
            // Always use customer email to map user and wallet for deposits.
            const customerEmail = data?.customer?.email;
            if (!customerEmail) {
                logger_service_1.default.warn("No customer email in webhook for deposit mapping", {
                    reference: effectiveReference,
                    tx_ref: data?.tx_ref,
                    rawKeys: Object.keys(data || {}),
                });
                return;
            }
            const user = await this.userUsecase.getUserByEmail(customerEmail);
            if (!user) {
                logger_service_1.default.warn("User not found for incoming credit via email", { email: customerEmail });
                return;
            }
            const wallet = await this.walletUsecase.getWalletByUserId(user.id);
            if (!wallet) {
                logger_service_1.default.warn("Wallet not found for user when crediting via email", { userId: user.id, email: customerEmail });
                return;
            }
            // Check for duplicate payment intent to prevent double-crediting
            const existingIntent = await this.paymentIntentUseCase.findByReference(effectiveReference);
            if (existingIntent) {
                logger_service_1.default.warn("Duplicate webhook for reference; skipping credit", {
                    reference: effectiveReference,
                    userId: user.id,
                    walletId: wallet.id,
                });
                return;
            }
            logger_service_1.default.info("Crediting wallet from webhook (email mapping ONLY)", {
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
                currency: data?.currency || wallet.currency,
                reference: effectiveReference,
                idempotencyKey: `FW-WH-${effectiveReference}`,
                status: constants_1.TransactionStatus.COMPLETED,
                provider: "flutterwave-payment",
                rawResponse: event,
            });
            return;
        }
        if (intent.provider === "flutterwave-transfer") {
            logger_service_1.default.warn("Received payment webhook for transfer intent", { reference: effectiveReference });
            return;
        }
        if (intent.status === constants_1.TransactionStatus.COMPLETED || intent.status === constants_1.TransactionStatus.FAILED) {
            logger_service_1.default.info("Payment intent already processed", {
                intentId: intent.id,
                status: intent.status,
                reference: effectiveReference,
            });
            return;
        }
        if ((status || "").toLowerCase() === "successful") {
            logger_service_1.default.info("Crediting wallet for successful payment intent", {
                walletId: intent.walletId,
                intentId: intent.id,
                amount,
                reference: effectiveReference,
            });
            await this.walletUsecase.updateWallet(intent.walletId, {
                balance: { increment: amount },
            });
            await this.paymentIntentUseCase.updateStatusAndRaw(intent.id, constants_1.TransactionStatus.COMPLETED, event);
        }
        else if ((status || "").toLowerCase() === "failed") {
            logger_service_1.default.warn("Payment webhook marked as failed", {
                intentId: intent.id,
                reference: effectiveReference,
                status,
            });
            await this.paymentIntentUseCase.updateStatusAndRaw(intent.id, constants_1.TransactionStatus.FAILED, event);
        }
        else {
            await this.paymentIntentUseCase.updateStatusAndRaw(intent.id, constants_1.TransactionStatus.PENDING, event);
        }
    }
    async handleTransferWebhook(event) {
        const data = event?.data;
        const status = data?.status || "";
        const reference = data?.reference;
        if (!reference) {
            logger_service_1.default.warn("Transfer webhook missing reference");
            return;
        }
        const intent = await this.paymentIntentUseCase.findByReference(reference);
        if (!intent) {
            logger_service_1.default.warn("Transfer intent not found for reference", { reference });
            return;
        }
        if (intent.provider !== "flutterwave-transfer") {
            logger_service_1.default.warn("Received transfer webhook for non-transfer intent", { reference, provider: intent.provider });
            return;
        }
        if (intent.status === constants_1.TransactionStatus.COMPLETED || intent.status === constants_1.TransactionStatus.FAILED) {
            return;
        }
        const normalizedStatus = status.toLowerCase();
        if (normalizedStatus === "successful" || normalizedStatus === "success") {
            logger_service_1.default.info("Transfer webhook marked successful", {
                intentId: intent.id,
                walletId: intent.walletId,
                reference,
            });
            await this.paymentIntentUseCase.updateStatusAndRaw(intent.id, constants_1.TransactionStatus.COMPLETED, event);
        }
        else if (normalizedStatus === "failed" ||
            normalizedStatus === "reversed" ||
            normalizedStatus === "cancelled") {
            // Refund reserved funds on failure.
            logger_service_1.default.warn("Transfer webhook failed; refunding reserved funds", {
                intentId: intent.id,
                walletId: intent.walletId,
                amount: intent.amount,
                reference,
                status,
            });
            await this.walletUsecase.updateWallet(intent.walletId, {
                balance: { increment: intent.amount },
            });
            await this.paymentIntentUseCase.updateStatusAndRaw(intent.id, constants_1.TransactionStatus.FAILED, event);
        }
        else {
            logger_service_1.default.info("Transfer webhook pending/other status", {
                intentId: intent.id,
                reference,
                status,
            });
            await this.paymentIntentUseCase.updateStatusAndRaw(intent.id, constants_1.TransactionStatus.PENDING, event);
        }
    }
    generateIdempotencyKey() {
        const timestamp = Date.now();
        return `FM-IDMP-${timestamp}`;
    }
    generateTxRef(userId) {
        const timestamp = Date.now();
        return `FW-${userId}-${timestamp}`;
    }
    generateTransferRef(userId) {
        const timestamp = Date.now();
        return `FW-TRF-${userId}-${timestamp}`;
    }
}
exports.default = TransactionService;
//# sourceMappingURL=transaction.service.js.map