"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("@providers/index");
const wallet_usecase_1 = __importDefault(require("@usecases/wallet.usecase"));
const logger_service_1 = __importDefault(require("./logger.service"));
class WalletService {
    constructor() {
        this.walletUsecase = new wallet_usecase_1.default();
    }
    async callFlutterwaveWalletCreation(userId, data) {
        try {
            const response = await index_1.flutterwaveWalletProvider.createWallet(data);
            let walletData = {};
            if (response.status === "success" && response.data) {
                walletData = {
                    userId: userId,
                    wallet_number: response.data.account_number,
                    bank_code: data.bank_code,
                    bank_name: response.data.bank_name,
                };
            }
            return this.walletUsecase.InitialiseWalletForUser(walletData);
        }
        catch (error) {
            logger_service_1.default.error(`Error creating wallet for user ${userId} with Flutterwave: ${error.message}`);
            throw error;
        }
    }
}
exports.default = WalletService;
//# sourceMappingURL=wallet.service.js.map