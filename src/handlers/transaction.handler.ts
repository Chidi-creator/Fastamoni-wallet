import { Request, Response } from "express";
import { responseManager } from "@managers/index";
import TransactionService from "@services/transaction.service";
import { AuthenticatedRequest } from "@services/types/auth";
import { CreditWalletPayload, DepositPayload } from "@services/types/wallet";
import UserUseCase from "@usecases/user.usecase";

class TransactionHandler {
  private transactionService: TransactionService;
  private userUseCase: UserUseCase;

  constructor() {
    this.transactionService = new TransactionService();
    this.userUseCase = new UserUseCase();
  }

  handleDonationTransfer = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        return responseManager.unauthorized(res, "User not authenticated");
      }

      const payload = req.body as CreditWalletPayload & { pin?: string };
      const { pin } = payload;
      const idempotencyKey = req.headers["idempotency-key"] as
        | string
        | undefined;

      if (!pin) {
        return responseManager.validationError(
          res,
          "PIN is required for transfer"
        );
      }

      const isPinValid = await this.userUseCase.verifyPin(userId, pin);
      if (!isPinValid) {
        return responseManager.unauthorized(res, "Invalid PIN");
      }

      const result = await this.transactionService.handleDonationTransfer(
        payload,
        userId,
        idempotencyKey
      );

      return responseManager.success(
        res,
        result,
        "Donation transfer completed",
        200
      );
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };

  setPin = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        return responseManager.unauthorized(res, "User not authenticated");
      }

      const { pin } = req.body as { pin?: string };
      if (!pin) {
        return responseManager.validationError(res, "PIN is required");
      }

      const user = await this.userUseCase.setPin(userId, pin);

      return responseManager.success(
        res,
        { id: user.id },
        "PIN set successfully",
        200
      );
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };

  updatePin = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        return responseManager.unauthorized(res, "User not authenticated");
      }

      const { oldPin, newPin } = req.body as {
        oldPin?: string;
        newPin?: string;
      };

      if (!oldPin || !newPin) {
        return responseManager.validationError(
          res,
          "oldPin and newPin are required"
        );
      }

      const user = await this.userUseCase.updatePin(userId, oldPin, newPin);

      return responseManager.success(
        res,
        { id: user.id },
        "PIN updated successfully",
        200
      );
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };

  initiateDeposit = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        return responseManager.unauthorized(res, "User not authenticated");
      }

      const payload = req.body as DepositPayload;
      const idempotencyKey = req.headers["idempotency-key"] as string | undefined;

      const result = await this.transactionService.initiateDeposit(
        payload,
        userId,
        idempotencyKey
      );

      return responseManager.success(res, result, "Deposit initiated", 200);
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };

  handleFlutterwaveWebhook = async (req: Request, res: Response) => {
    try {
      await this.transactionService.handleFlutterwaveWebhook(req.body, req.headers as any);
      return res.status(200).send("OK");
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };
}

export default TransactionHandler;
