import AccountService from "@services/account.service";
import { Request, Response } from "express";
import { AuthenticatedRequest } from "@services/types/auth";
import AccountUseCase from "@usecases/account.usecase";
import { responseManager } from "@managers/index";
import { resolveBankAccountRequest } from "@services/types/bank";
import { validateAccountCreation } from "@validation/account";
import { Account } from "@prisma/client";

class AcccountHandler {
  accountService: AccountService;
  accountusecase: AccountUseCase;

  constructor() {
    this.accountService = new AccountService();
    this.accountusecase = new AccountUseCase();
  }

  createAccount = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id as string;

      if (!authReq.user || !authReq.user.id || !userId) {
        return responseManager.unauthorized(res, "User not authenticated");
      }
      const data: resolveBankAccountRequest = req.body;

      const { error } = validateAccountCreation(req.body);
      if (error) {
        return responseManager.validationError(res, error.details[0].message);
      }

      const account: Account = await this.accountService.resolveBankAccount(
        userId,
        data
      );
      return responseManager.success(
        res,
        account,
        "Bank account resolved and created successfully",
        201
      );
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };

    findUserAccountsById = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id

      if (!authReq.user || !authReq.user.id || !userId) {
        return responseManager.unauthorized(res, "User not authenticated");
      }

      const accounts: Account[] =
        await this.accountusecase.getAccountsByUserId(userId);

      return responseManager.success(
        res,
        accounts,
        "User accounts retrieved successfully"
      );
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };
}
export default AcccountHandler;
