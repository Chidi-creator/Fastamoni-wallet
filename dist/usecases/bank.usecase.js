"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const banks_repository_1 = __importDefault(require("@repositories/banks.repository"));
const cache_service_1 = __importDefault(require("@services/cache.service"));
class BankUsecase {
    constructor() {
        this.bankRepository = new banks_repository_1.default();
        this.cacheService = new cache_service_1.default();
    }
    async insertMany(data) {
        return this.bankRepository.insertMany(data);
    }
    async findAllBanks() {
        return this.bankRepository.findAllBanks();
    }
    async findBanksWithSkipAndLimit(limit, skip) {
        const cacheKey = `banks:limit:${limit}:skip:${skip}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const result = await this.bankRepository.findBanksWithSkipAndLimit(limit, skip);
        await this.cacheService.set(cacheKey, result, 3600); // Cache for 1 hour
        return result;
    }
    async findByBankCode(bankCode) {
        return this.bankRepository.findByBankCode(bankCode);
    }
}
exports.default = BankUsecase;
//# sourceMappingURL=bank.usecase.js.map