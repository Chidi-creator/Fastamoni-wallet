"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../managers/index");
const transaction_service_1 = __importDefault(require("../services/transaction.service"));
const user_usecase_1 = __importDefault(require("../usecases/user.usecase"));
const transaction_jobs_1 = require("../engine/jobs/transaction.jobs");
const cache_service_1 = __importDefault(require("../services/cache.service"));
class TransactionHandler {
    constructor() {
        this.handleDonationTransfer = async (req, res) => {
            try {
                const authReq = req;
                const userId = authReq.user?.id;
                if (!userId) {
                    return index_1.responseManager.unauthorized(res, "User not authenticated");
                }
                const payload = req.body;
                const { pin } = payload;
                const idempotencyKey = req.headers["idempotency-key"];
                if (!pin) {
                    return index_1.responseManager.validationError(res, "PIN is required for transfer");
                }
                const isPinValid = await this.userUseCase.verifyPin(userId, pin);
                if (!isPinValid) {
                    return index_1.responseManager.unauthorized(res, "Invalid PIN");
                }
                // Queue the donation transfer job
                await (0, transaction_jobs_1.addDonationTransferJob)({
                    payload,
                    donorUserId: userId,
                    idempotencyKey,
                });
                return index_1.responseManager.success(res, { message: "Donation transfer queued for processing" }, "Donation transfer initiated", 202);
            }
            catch (error) {
                return index_1.responseManager.handleError(res, error);
            }
        };
        this.setPin = async (req, res) => {
            try {
                const authReq = req;
                const userId = authReq.user?.id;
                if (!userId) {
                    return index_1.responseManager.unauthorized(res, "User not authenticated");
                }
                const { pin } = req.body;
                if (!pin) {
                    return index_1.responseManager.validationError(res, "PIN is required");
                }
                const user = await this.userUseCase.setPin(userId, pin);
                return index_1.responseManager.success(res, { id: user.id }, "PIN set successfully", 200);
            }
            catch (error) {
                return index_1.responseManager.handleError(res, error);
            }
        };
        this.updatePin = async (req, res) => {
            try {
                const authReq = req;
                const userId = authReq.user?.id;
                if (!userId) {
                    return index_1.responseManager.unauthorized(res, "User not authenticated");
                }
                const { oldPin, newPin } = req.body;
                if (!oldPin || !newPin) {
                    return index_1.responseManager.validationError(res, "oldPin and newPin are required");
                }
                const user = await this.userUseCase.updatePin(userId, oldPin, newPin);
                return index_1.responseManager.success(res, { id: user.id }, "PIN updated successfully", 200);
            }
            catch (error) {
                return index_1.responseManager.handleError(res, error);
            }
        };
        this.initiateBankTransfer = async (req, res) => {
            try {
                const authReq = req;
                const userId = authReq.user?.id;
                if (!userId) {
                    return index_1.responseManager.unauthorized(res, "User not authenticated");
                }
                const payload = req.body;
                const { pin, ...transferPayload } = payload;
                const idempotencyKey = req.headers["idempotency-key"];
                if (!pin) {
                    return index_1.responseManager.validationError(res, "PIN is required for bank transfer");
                }
                const isPinValid = await this.userUseCase.verifyPin(userId, pin);
                if (!isPinValid) {
                    return index_1.responseManager.unauthorized(res, "Invalid PIN");
                }
                // Queue the bank transfer job
                await (0, transaction_jobs_1.addBankTransferJob)({
                    payload: transferPayload,
                    userId,
                    idempotencyKey,
                });
                return index_1.responseManager.success(res, { message: "Bank transfer queued for processing" }, "Bank transfer initiated", 202);
            }
            catch (error) {
                return index_1.responseManager.handleError(res, error);
            }
        };
        this.handleFlutterwaveWebhook = async (req, res) => {
            try {
                // Queue the webhook for processing
                await (0, transaction_jobs_1.addWebhookJob)({ body: req.body, headers: req.headers });
                return res.status(200).send("OK");
            }
            catch (error) {
                return index_1.responseManager.handleError(res, error);
            }
        };
        this.getDonationCount = async (req, res) => {
            try {
                const authReq = req;
                const userId = authReq.user?.id;
                if (!userId) {
                    return index_1.responseManager.unauthorized(res, "User not authenticated");
                }
                const cacheService = new cache_service_1.default();
                const cacheKey = `donation_count_${userId}`;
                const cachedCount = await cacheService.get(cacheKey);
                if (cachedCount !== null) {
                    return index_1.responseManager.success(res, { count: cachedCount }, "Donation count retrieved from cache", 200);
                }
                const count = await this.transactionService.getDonationCount(userId);
                await cacheService.set(cacheKey, count, 300); // 5 mins cache
                return index_1.responseManager.success(res, { count }, "Donation count retrieved successfully", 200);
            }
            catch (error) {
                return index_1.responseManager.handleError(res, error);
            }
        };
        this.transactionService = new transaction_service_1.default();
        this.userUseCase = new user_usecase_1.default();
    }
}
exports.default = TransactionHandler;
//# sourceMappingURL=transaction.handler.js.map