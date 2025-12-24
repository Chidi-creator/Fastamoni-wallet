"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const banks_repository_1 = __importDefault(require("@repositories/banks.repository"));
class BankUsecase {
    constructor() {
        this.bankRepository = new banks_repository_1.default();
    }
    async insertMany(data) {
        return this.bankRepository.insertMany(data);
    }
    async findAllBanks() {
        return this.bankRepository.findAllBanks();
    }
    async findBanksWithSkipAndLimit(limit, skip) {
        return this.bankRepository.findBanksWithSkipAndLimit(limit, skip);
    }
    async findByBankCode(bankCode) {
        return this.bankRepository.findByBankCode(bankCode);
    }
}
exports.default = BankUsecase;
//# sourceMappingURL=bank.usecase.js.map