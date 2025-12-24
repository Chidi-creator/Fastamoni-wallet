"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../db/prisma"));
const error_manager_1 = require("../managers/error.manager");
class PaymentIntentRepository {
    async create(data) {
        try {
            return await prisma_1.default.paymentIntent.create({ data });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error creating payment intent: ${error.message}`);
        }
    }
    async findByIdempotencyKey(idempotencyKey) {
        try {
            return await prisma_1.default.paymentIntent.findUnique({ where: { idempotencyKey } });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error finding payment intent by idempotency key: ${error.message}`);
        }
    }
    async findByReference(reference) {
        try {
            return await prisma_1.default.paymentIntent.findUnique({ where: { reference } });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error finding payment intent by reference: ${error.message}`);
        }
    }
    async updateStatusAndRaw(id, status, rawResponse) {
        try {
            return await prisma_1.default.paymentIntent.update({
                where: { id },
                data: { status, rawResponse },
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error updating payment intent: ${error.message}`);
        }
    }
}
exports.default = PaymentIntentRepository;
//# sourceMappingURL=paymentIntent.repository.js.map