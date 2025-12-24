"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("@config/env");
const logger_service_1 = __importDefault(require("@services/logger.service"));
const axios_1 = __importDefault(require("axios"));
class FlutterwaveWalletProvider {
    constructor() {
        this.url = "https://api.flutterwave.com/v3/virtual-account-numbers";
        this.apiKey = env_1.env.FLUTTERWAVE_SANDBOX_SECRET_KEY;
    }
    static getInstance() {
        if (!FlutterwaveWalletProvider.instance) {
            FlutterwaveWalletProvider.instance = new FlutterwaveWalletProvider();
        }
        return FlutterwaveWalletProvider.instance;
    }
    async createWallet(request) {
        logger_service_1.default.info(`Creating wallet with Flutterwave for account: ${request.firstname}`);
        const response = await axios_1.default.post(this.url, request, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
        });
        if (response.data.status !== "success") {
            logger_service_1.default.error(`Flutterwave API Error: ${response.data.message}`);
        }
        return response.data;
    }
}
exports.default = FlutterwaveWalletProvider;
//# sourceMappingURL=flutterwave.js.map