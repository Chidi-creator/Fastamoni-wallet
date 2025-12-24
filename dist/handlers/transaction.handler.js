"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("@managers/index");
const transaction_service_1 = __importDefault(require("@services/transaction.service"));
const user_usecase_1 = __importDefault(require("@usecases/user.usecase"));
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
                const result = await this.transactionService.handleDonationTransfer(payload, userId, idempotencyKey);
                return index_1.responseManager.success(res, result, "Donation transfer completed", 200);
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
                const result = await this.transactionService.initiateBankTransfer(transferPayload, userId, idempotencyKey);
                return index_1.responseManager.success(res, result, "Bank transfer initiated", 200);
            }
            catch (error) {
                return index_1.responseManager.handleError(res, error);
            }
        };
        this.handleFlutterwaveWebhook = async (req, res) => {
            try {
                await this.transactionService.handleFlutterwaveWebhook(req.body, req.headers);
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
                const count = await this.transactionService.getDonationCount(userId);
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