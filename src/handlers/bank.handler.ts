import { responseManager } from "@managers/index";
import { Request, Response } from "express";
import BankUsecase from "@usecases/bank.usecase";

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

      const { banks, totalItems } =
        await this.bankUseCase.findBanksWithSkipAndLimit(limit, skip);

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
