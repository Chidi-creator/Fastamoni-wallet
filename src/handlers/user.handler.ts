import { responseManager } from "@managers/index";
import { Prisma } from "@prisma/client";
import UserUseCase from "@usecases/user.usecase";
import WalletUsecase from "@usecases/wallet.usecase";
import { validateUserCreation } from "@validation/user";
import { Request, Response } from "express";
export class UserHandler {
  userUsecase: UserUseCase;
  walletUsecase: WalletUsecase;

  constructor() {
    this.userUsecase = new UserUseCase();
    this.walletUsecase = new WalletUsecase();
  }
   handleCreateUser = async (req: Request, res: Response) => {
    try {
      const data: Prisma.UserCreateInput = req.body;

      const { error } = validateUserCreation(data);

      if (error) {
        return responseManager.validationError(res, error.details[0].message);
      }

      const newUser = await this.userUsecase.createUser(data);

      const walletData: Prisma.WalletUncheckedCreateInput = {
        userId: newUser.id,
      };

      const newWallet = await this.walletUsecase.InitialiseWalletForUser(
        walletData
      );

      return responseManager.success(
        res,
        { user: newUser, wallet: newWallet },
        "User created successfully",
        201
      );
    } catch (error: any) {
        return responseManager.handleError(res, error);
    }
  }
}

export default UserHandler;
