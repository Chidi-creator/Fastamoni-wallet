"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../db/prisma"));
const error_manager_1 = require("../managers/error.manager");
class TransactionRepository {
    async createTransaction(data) {
        try {
            return await prisma_1.default.transaction.create({ data });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error creating transaction: ${error.message}`);
        }
    }
    async findByDonationId(donationId) {
        try {
            return await prisma_1.default.transaction.findUnique({ where: { donationId } });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error finding transaction by donation: ${error.message}`);
        }
    }
    async findByIdempotencyKey(idempotencyKey) {
        try {
            return await prisma_1.default.transaction.findUnique({ where: { idempotencyKey } });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error finding transaction by idempotency key: ${error.message}`);
        }
    }
    async updateStatus(id, status) {
        try {
            return await prisma_1.default.transaction.update({ where: { id }, data: { status } });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error updating transaction status: ${error.message}`);
        }
    }
    // Handles wallet-to-wallet transfer atomically using conditional updates to avoid race conditions.
    async handleInternalWalletTransfer(senderWalletId, receiverWalletId, amount) {
        if (amount <= 0) {
            throw new error_manager_1.DatabaseError("Transfer amount must be positive");
        }
        try {
            await prisma_1.default.$transaction(async (tx) => {
                // Decrement sender balance only if sufficient funds; updateMany + gte guard prevents race.
                const senderResult = await tx.wallet.updateMany({
                    where: {
                        id: senderWalletId,
                        balance: { gte: amount },
                    },
                    data: { balance: { decrement: amount } },
                });
                if (senderResult.count === 0) {
                    throw new error_manager_1.DatabaseError("Insufficient balance or sender wallet not found");
                }
                // Ensure receiver exists; increment balance.
                const receiver = await tx.wallet.update({
                    where: { id: receiverWalletId },
                    data: { balance: { increment: amount } },
                });
                if (!receiver) {
                    throw new error_manager_1.DatabaseError("Receiver wallet not found");
                }
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error handling internal wallet transfer: ${error.message}`);
        }
    }
}
exports.default = TransactionRepository;
//# sourceMappingURL=transaction.repository.js.map