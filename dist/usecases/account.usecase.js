"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const account_repository_1 = __importDefault(require("@repositories/account.repository"));
class AccountUseCase {
    constructor() {
        this.accountRepository = new account_repository_1.default();
    }
    async createAccount(data) {
        return this.accountRepository.createAccount(data);
    }
    async getAccountsByUserId(userId) {
        return this.accountRepository.findAccountsByUserId(userId);
    }
    async deleteAccount(id) {
        return this.accountRepository.deleteAccount(id);
    }
}
exports.default = AccountUseCase;
//# sourceMappingURL=account.usecase.js.map