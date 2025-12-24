"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transaction_repository_1 = __importDefault(require("../repositories/transaction.repository"));
class TransactionUseCase {
    constructor() {
        this.transactionRepository = new transaction_repository_1.default();
    }
    async createTransaction(data) {
        return this.transactionRepository.createTransaction(data);
    }
    async getByDonationId(donationId) {
        return this.transactionRepository.findByDonationId(donationId);
    }
    async getByIdempotencyKey(idempotencyKey) {
        return this.transactionRepository.findByIdempotencyKey(idempotencyKey);
    }
    async updateStatus(id, status) {
        return this.transactionRepository.updateStatus(id, status);
    }
    async handleInternalWalletTransfer(senderWalletId, receiverWalletId, amount) {
        return this.transactionRepository.handleInternalWalletTransfer(senderWalletId, receiverWalletId, amount);
    }
}
exports.default = TransactionUseCase;
//# sourceMappingURL=transaction.usecase.js.map