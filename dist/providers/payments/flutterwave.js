"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../../config/env");
const logger_service_1 = __importDefault(require("../../services/logger.service"));
class FlutterwavePaymentProvider {
    constructor() {
        this.transferUrl = "https://api.flutterwave.com/v3/transfers";
        this.apiKey = env_1.env.FLUTTERWAVE_SANDBOX_SECRET_KEY;
    }
    static getInstance() {
        if (!FlutterwavePaymentProvider.instance) {
            FlutterwavePaymentProvider.instance = new FlutterwavePaymentProvider();
        }
        return FlutterwavePaymentProvider.instance;
    }
    async initiateTransfer(request) {
        try {
            logger_service_1.default.info("Initiating Flutterwave bank transfer", {
                account_bank: request.account_bank,
                account_number: request.account_number,
                amount: request.amount,
                currency: request.currency,
            });
            const response = await axios_1.default.post(this.transferUrl, request, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
            });
            if (response.data.status !== "success") {
                logger_service_1.default.error(`Flutterwave transfer API error: ${response.data.message}`);
            }
            return response.data;
        }
        catch (error) {
            logger_service_1.default.error(`Flutterwave transfer error: ${error.message}`, {
                response: error?.response?.data,
            });
            throw error;
        }
    }
}
exports.default = FlutterwavePaymentProvider;
//# sourceMappingURL=flutterwave.js.map