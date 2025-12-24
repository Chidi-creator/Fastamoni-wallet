"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../db/prisma"));
const error_manager_1 = require("../managers/error.manager");
class UserRepository {
    async create(data) {
        try {
            return await prisma_1.default.user.create({
                data,
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error creating user: ${error.message}`);
        }
    }
    async findById(id) {
        try {
            return await prisma_1.default.user.findUnique({
                where: { id },
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error finding user by id: ${error.message}`);
        }
    }
    async findByEmail(email) {
        try {
            return await prisma_1.default.user.findUnique({
                where: { email },
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error finding user by email: ${error.message}`);
        }
    }
    async update(id, data) {
        try {
            return await prisma_1.default.user.update({
                where: { id },
                data,
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error updating user: ${error.message}`);
        }
    }
    async setPinHash(id, pinHash) {
        try {
            return await prisma_1.default.user.update({
                where: { id },
                data: { pinHash },
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error setting PIN: ${error.message}`);
        }
    }
    async getPinHash(id) {
        try {
            const user = await prisma_1.default.user.findUnique({
                where: { id },
                select: { pinHash: true },
            });
            return user?.pinHash ?? null;
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error fetching PIN: ${error.message}`);
        }
    }
    async delete(id) {
        try {
            // Soft delete by setting deletedAt
            return await prisma_1.default.user.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error deleting user: ${error.message}`);
        }
    }
}
exports.default = UserRepository;
//# sourceMappingURL=users.repository.js.map