"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const paymentIntent_repository_1 = __importDefault(require("../repositories/paymentIntent.repository"));
class PaymentIntentUseCase {
    constructor() {
        this.repo = new paymentIntent_repository_1.default();
    }
    create(data) {
        return this.repo.create(data);
    }
    findByIdempotencyKey(key) {
        return this.repo.findByIdempotencyKey(key);
    }
    findByReference(ref) {
        return this.repo.findByReference(ref);
    }
    updateStatusAndRaw(id, status, raw) {
        return this.repo.updateStatusAndRaw(id, status, raw);
    }
}
exports.default = PaymentIntentUseCase;
//# sourceMappingURL=paymentIntent.usecase.js.map