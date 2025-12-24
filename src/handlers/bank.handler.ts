import { responseManager } from "@managers/index";
import { Request, Response } from "express";
import BankUsecase from "@usecases/bank.usecase";
import CacheService from "@services/cache.service";

class BankHandler {
  bankUseCase: BankUsecase;
  constructor() {
    this.bankUseCase = new BankUsecase();
  }

  getAllBanks = async (req: Request, res: Response) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.max(1, Number(req.query.limit) || 10);
      const skip = (page - 1) * limit;

      const cacheKey = `banks_page_${page}_limit_${limit}`;
      const cacheService = new CacheService();
      
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
          return responseManager.success(
              res,
              cachedData,
              "Banks retrieved from cache",
              200
          );
      }

      const { banks, totalItems } =
        await this.bankUseCase.findBanksWithSkipAndLimit(limit, skip);

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

      return responseManager.paginate(
        res,
        banks,
        totalItems,
        page,
        limit,
        "Banks retrieved successfully",
        200
      );
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };
}
export default BankHandler;
