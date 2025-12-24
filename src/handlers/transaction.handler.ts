import { Request, Response } from "express";
import { responseManager } from "@managers/index";
import TransactionService from "@services/transaction.service";
import { AuthenticatedRequest } from "@services/types/auth";
import { CreditWalletPayload, WithdrawToAccountPayload } from "@services/types/wallet";
import UserUseCase from "@usecases/user.usecase";
import { addDonationTransferJob, addBankTransferJob, addWebhookJob } from "engine/jobs/transaction.jobs";
import CacheService from "@services/cache.service";

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

      // Queue the donation transfer job
      await addDonationTransferJob({
        payload,
        donorUserId: userId,
        idempotencyKey,
      });

      return responseManager.success(
        res,
        { message: "Donation transfer queued for processing" },
        "Donation transfer initiated",
        202
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

  initiateBankTransfer = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        return responseManager.unauthorized(res, "User not authenticated");
      }

      const payload = req.body as WithdrawToAccountPayload & { pin?: string };
      const { pin, ...transferPayload } = payload;
      const idempotencyKey = req.headers["idempotency-key"] as string | undefined;

      if (!pin) {
        return responseManager.validationError(res, "PIN is required for bank transfer");
      }

      const isPinValid = await this.userUseCase.verifyPin(userId, pin);
      if (!isPinValid) {
        return responseManager.unauthorized(res, "Invalid PIN");
      }

      // Queue the bank transfer job
      await addBankTransferJob({
        payload: transferPayload,
        userId,
        idempotencyKey,
      });

      return responseManager.success(res, { message: "Bank transfer queued for processing" }, "Bank transfer initiated", 202);
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };

  handleFlutterwaveWebhook = async (req: Request, res: Response) => {
    try {
      // Queue the webhook for processing
      await addWebhookJob({ body: req.body, headers: req.headers as any });
      return res.status(200).send("OK");
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };

  getDonationCount = async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        return responseManager.unauthorized(res, "User not authenticated");
      }

      const cacheService = new CacheService();
      const cacheKey = `donation_count_${userId}`;
      const cachedCount = await cacheService.get(cacheKey);

      if (cachedCount !== null) {
          return responseManager.success(res, { count: cachedCount }, "Donation count retrieved from cache", 200);
      }

      const count = await this.transactionService.getDonationCount(userId);
      await cacheService.set(cacheKey, count, 300); // 5 mins cache

      return responseManager.success(res, { count }, "Donation count retrieved successfully", 200);
    } catch (error: any) {
      return responseManager.handleError(res, error);
    }
  };
}

export default TransactionHandler;
