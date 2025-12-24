"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_service_1 = require("@services/auth.service");
const transaction_handler_1 = __importDefault(require("@handlers/transaction.handler"));
const router = express_1.default.Router();
const authService = new auth_service_1.AuthService();
const transactionHandler = new transaction_handler_1.default();
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
exports.default = router;
//# sourceMappingURL=transaction.delivery.js.map