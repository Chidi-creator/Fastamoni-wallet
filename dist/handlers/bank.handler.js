"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../managers/index");
const bank_usecase_1 = __importDefault(require("../usecases/bank.usecase"));
const cache_service_1 = __importDefault(require("../services/cache.service"));
class BankHandler {
    constructor() {
        this.getAllBanks = async (req, res) => {
            try {
                const page = Math.max(1, Number(req.query.page) || 1);
                const limit = Math.max(1, Number(req.query.limit) || 10);
                const skip = (page - 1) * limit;
                const cacheKey = `banks_page_${page}_limit_${limit}`;
                const cacheService = new cache_service_1.default();
                const cachedData = await cacheService.get(cacheKey);
                if (cachedData) {
                    return index_1.responseManager.success(res, cachedData, "Banks retrieved from cache", 200);
                }
                const { banks, totalItems } = await this.bankUseCase.findBanksWithSkipAndLimit(limit, skip);
                const responseData = {
                    data: banks,
                    pagination: {
                        totalItems,
                        currentPage: page,
                        itemsPerPage: limit,
                        totalPages: Math.ceil(totalItems / limit),
                    }
                };
                // Cache for 1 hour
                await cacheService.set(cacheKey, responseData, 3600);
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