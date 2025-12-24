"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("../../config/env");
const axios_1 = __importDefault(require("axios"));
const logger_service_1 = __importDefault(require("../../services/logger.service"));
class FlutterwaveBankResolver {
    constructor() {
        this.url = "https://api.flutterwave.com/v3/accounts/resolve";
        this.apiKey = env_1.env.FLUTTERWAVE_SANDBOX_SECRET_KEY;
    }
    //singleton instance
    static getInstance() {
        if (!FlutterwaveBankResolver.instance) {
            FlutterwaveBankResolver.instance = new FlutterwaveBankResolver();
        }
        return FlutterwaveBankResolver.instance;
    }
    //call flutterwave api to resolve bank account
    async callResolveBankAccountAPI(bankData) {
        const response = await axios_1.default.post(this.url, bankData, {
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
        });
        if (response.data.status !== "success") {
            logger_service_1.default.error(`Flutterwave API Error: ${response.data.message}`);
            throw new Error(`Flutterwave API Error: ${response.data.message}`);
        }
        return response.data;
    }
}
exports.default = FlutterwaveBankResolver;
//# sourceMappingURL=flutterwave.js.map