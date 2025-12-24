"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const account_usecase_1 = __importDefault(require("@usecases/account.usecase"));
const bank_usecase_1 = __importDefault(require("@usecases/bank.usecase"));
const index_1 = require("@providers/index");
const error_manager_1 = require("@managers/error.manager");
const logger_service_1 = __importDefault(require("./logger.service"));
class AccountService {
    constructor() {
        this.bankUsecase = new bank_usecase_1.default();
        this.accountUsecase = new account_usecase_1.default();
    }
    async resolveBankAccount(userId, data) {
        const payload = {
            account_number: data.account_number,
            account_bank: data.bank_code,
        };
        try {
            const response = await index_1.flutterwaveBankResolver.callResolveBankAccountAPI(payload);
            let accountData = {};
            if (response.status === "success") {
                const bank = await this.bankUsecase.findByBankCode(data.bank_code);
                if (!bank) {
                    logger_service_1.default.error(`Bank with code ${data.bank_code} not found in local database.`);
                    throw new error_manager_1.ProviderError(`Bank with code ${data.bank_code} not found in local database.`);
                }
                if (bank.id == null || bank.id == undefined) {
                    logger_service_1.default.error(`Bank with code ${data.bank_code} has no id in local database.`);
                    throw new error_manager_1.ProviderError(`Bank with code ${data.bank_code} has no id in local database.`);
                }
                accountData = {
                    bankId: bank.id,
                    userId: userId,
                    account_number: data.account_number,
                    bank_code: data.bank_code,
                    account_name: response.data.account_name,
                };
            }
            return this.accountUsecase.createAccount(accountData);
        }
        catch (error) {
            logger_service_1.default.error(`Error resolving bank account: ${error.message}`);
            throw new error_manager_1.ProviderError(`Error resolving bank account: ${error.message}`);
        }
    }
}
exports.default = AccountService;
//# sourceMappingURL=account.service.js.map