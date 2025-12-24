import { JOBS } from "@config/constants";
import { responseManager } from "@managers/index";
import { Prisma } from "@prisma/client";
import { CreateWalletRequest } from "@providers/wallet/types/wallet";
import WalletService from "@services/wallet.service";
import UserUseCase from "@usecases/user.usecase";
import WalletUsecase from "@usecases/wallet.usecase";
import { validateUserCreation } from "@validation/user";
import { addWalletJobs } from "engine/jobs/wallet.jobs";
import { Request, Response } from "express";
export class UserHandler {
  userUsecase: UserUseCase;
  walletService: WalletService;
  constructor() {
    this.userUsecase = new UserUseCase();
    this.walletService = new WalletService();
  }
  handleCreateUser = async (req: Request, res: Response) => {
    try {
      const data: Prisma.UserCreateInput = req.body;

      const { error } = validateUserCreation(data);

      if (error) {
        return responseManager.validationError(res, error.details[0].message);
      }

      const newUser = await this.userUsecase.createUser(data);

      const walletData: CreateWalletRequest = {
        email: newUser.email,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        currency: "NGN",
        bank_code: "044", // Access bank code as default
        bvn: "22222222222", // Dummy BVN for now,
        is_permanent: true,
      };

      
      await addWalletJobs(JOBS.CREATE_USER_WALLET, {
        userId: newUser.id,
        walletData,
      });

      return responseManager.success(
        res,
        { user: newUser },
        "User created successfully",
        201
      );
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };
}

export default UserHandler;
