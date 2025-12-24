"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_service_1 = __importDefault(require("../services/logger.service"));
const wallet_worker_1 = require("./workers/wallet.worker");
const transaction_worker_1 = require("./workers/transaction.worker");
const setUpWorkers = async () => {
    logger_service_1.default.info("Setting up workers...");
    await (0, wallet_worker_1.startWalletWorker)();
    await (0, transaction_worker_1.startTransactionWorker)();
};
exports.default = setUpWorkers;
//# sourceMappingURL=index.js.map