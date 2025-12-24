"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wallet_repository_1 = __importDefault(require("@repositories/wallet.repository"));
const logger_service_1 = __importDefault(require("@services/logger.service"));
class WalletUsecase {
    constructor() {
        this.walletRepository = new wallet_repository_1.default();
    }
    async InitialiseWalletForUser(data) {
        logger_service_1.default.info("Initializing wallet for user with data:", data);
        return this.walletRepository.create(data);
    }
    async getWalletById(id) {
        return this.walletRepository.findById(id);
    }
    async getWalletByUserId(userId) {
        return this.walletRepository.findByUserId(userId);
    }
    async updateWallet(id, data) {
        return this.walletRepository.update(id, data);
    }
    async deleteWallet(id) {
        return this.walletRepository.delete(id);
    }
    async getWalletByAccountNumber(walletNumber) {
        return this.walletRepository.findWalletByAccountNumber(walletNumber);
    }
}
exports.default = WalletUsecase;
//# sourceMappingURL=wallet.usecase.js.map