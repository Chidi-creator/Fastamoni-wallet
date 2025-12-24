"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const account_service_1 = __importDefault(require("@services/account.service"));
const account_usecase_1 = __importDefault(require("@usecases/account.usecase"));
const index_1 = require("@managers/index");
const account_1 = require("@validation/account");
class AcccountHandler {
    constructor() {
        this.createAccount = async (req, res) => {
            try {
                const authReq = req;
                const userId = authReq.user?.id;
                if (!authReq.user || !authReq.user.id || !userId) {
                    return index_1.responseManager.unauthorized(res, "User not authenticated");
                }
                const data = req.body;
                const { error } = (0, account_1.validateAccountCreation)(req.body);
                if (error) {
                    return index_1.responseManager.validationError(res, error.details[0].message);
                }
                const account = await this.accountService.resolveBankAccount(userId, data);
                return index_1.responseManager.success(res, account, "Bank account resolved and created successfully", 201);
            }
            catch (error) {
                return index_1.responseManager.handleError(res, error);
            }
        };
        this.findUserAccountsById = async (req, res) => {
            try {
                const authReq = req;
                const userId = authReq.user?.id;
                if (!authReq.user || !authReq.user.id || !userId) {
                    return index_1.responseManager.unauthorized(res, "User not authenticated");
                }
                const accounts = await this.accountusecase.getAccountsByUserId(userId);
                return index_1.responseManager.success(res, accounts, "User accounts retrieved successfully");
            }
            catch (error) {
                return index_1.responseManager.handleError(res, error);
            }
        };
        this.accountService = new account_service_1.default();
        this.accountusecase = new account_usecase_1.default();
    }
}
exports.default = AcccountHandler;
//# sourceMappingURL=account.handler.js.map