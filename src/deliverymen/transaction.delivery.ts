import express from "express";
import { AuthService } from "@services/auth.service";
import TransactionHandler from "@handlers/transaction.handler";

const router = express.Router();
const authService = new AuthService();
const transactionHandler = new TransactionHandler();

router
  .route("/transfer")
  .post([authService.auth], transactionHandler.handleDonationTransfer);

router
  .route("/pin")
  .post([authService.auth], transactionHandler.setPin)
  .patch([authService.auth], transactionHandler.updatePin);

router
  .route("/deposit/initiate")
  .post([authService.auth], transactionHandler.initiateDeposit);

router
  .route("/webhook/flutterwave")
  .post(transactionHandler.handleFlutterwaveWebhook);

export default router;
