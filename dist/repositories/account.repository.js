"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../db/prisma"));
const error_manager_1 = require("../managers/error.manager");
class AccountRepository {
    // Repository methods here
    async createAccount(data) {
        try {
            return await prisma_1.default.account.create({
                data,
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error creating account: ${error.message}`);
        }
    }
    async findAccountsByUserId(userId) {
        try {
            return await prisma_1.default.account.findMany({
                where: { userId },
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error finding accounts by user ID: ${error.message}`);
        }
    }
    async deleteAccount(id) {
        try {
            // Soft delete by setting deletedAt
            return await prisma_1.default.account.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error deleting account: ${error.message}`);
        }
    }
}
exports.default = AccountRepository;
//# sourceMappingURL=account.repository.js.map