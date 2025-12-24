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
  .route("/transfer/bank")
  .post([authService.auth], transactionHandler.initiateBankTransfer);

router
  .route("/pin")
  .post([authService.auth], transactionHandler.setPin)
  .patch([authService.auth], transactionHandler.updatePin);

router
  .route("/donations/count")
  .get([authService.auth], transactionHandler.getDonationCount);

router
  .route("/webhook/flutterwave")
  .post(transactionHandler.handleFlutterwaveWebhook);

export default router;
