"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("@managers/index");
const bank_usecase_1 = __importDefault(require("@usecases/bank.usecase"));
class BankHandler {
    constructor() {
        this.getAllBanks = async (req, res) => {
            try {
                const page = Math.max(1, Number(req.query.page) || 1);
                const limit = Math.max(1, Number(req.query.limit) || 10);
                const skip = (page - 1) * limit;
                const { banks, totalItems } = await this.bankUseCase.findBanksWithSkipAndLimit(limit, skip);
                return index_1.responseManager.paginate(res, banks, totalItems, page, limit, "Banks retrieved successfully", 200);
            }
            catch (error) {
                return index_1.responseManager.handleError(res, error);
            }
        };
        this.bankUseCase = new bank_usecase_1.default();
    }
}
exports.default = BankHandler;
//# sourceMappingURL=bank.handler.js.map