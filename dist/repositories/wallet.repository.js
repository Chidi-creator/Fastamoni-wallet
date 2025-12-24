"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../db/prisma"));
const error_manager_1 = require("../managers/error.manager");
class WalletRepository {
    async create(data) {
        try {
            return await prisma_1.default.wallet.create({
                data,
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error creating wallet: ${error.message}`);
        }
    }
    async findWalletByAccountNumber(walletNumber) {
        try {
            return await prisma_1.default.wallet.findUnique({
                where: { wallet_number: walletNumber },
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error finding wallet by account number: ${error.message}`);
        }
    }
    async findById(id) {
        try {
            return await prisma_1.default.wallet.findUnique({
                where: { id },
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error finding wallet by id: ${error.message}`);
        }
    }
    async findByUserId(userId) {
        try {
            return await prisma_1.default.wallet.findUnique({
                where: { userId },
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error finding wallet by user ID: ${error.message}`);
        }
    }
    async update(id, data) {
        try {
            return await prisma_1.default.wallet.update({
                where: { id },
                data,
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error updating wallet: ${error.message}`);
        }
    }
    async delete(id) {
        try {
            // Soft delete by setting deletedAt
            return await prisma_1.default.wallet.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error deleting wallet: ${error.message}`);
        }
    }
}
exports.default = WalletRepository;
//# sourceMappingURL=wallet.repository.js.map