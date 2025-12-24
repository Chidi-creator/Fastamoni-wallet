"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWalletWorker = void 0;
const constants_1 = require("@config/constants");
const logger_service_1 = __importDefault(require("@services/logger.service"));
const queue_service_1 = __importDefault(require("@services/queue.service"));
const wallet_service_1 = __importDefault(require("@services/wallet.service"));
const queueService = new queue_service_1.default();
const walletService = new wallet_service_1.default();
const startWalletWorker = async () => {
    try {
        await queueService.createWorker(constants_1.QueueNames.WALLET_QUEUE, async (job) => {
            switch (job.name) {
                case constants_1.JOBS.CREATE_USER_WALLET:
                    logger_service_1.default.info("Processing CREATE_USER_WALLET job", {
                        jobId: job.id,
                        data: job.data,
                    });
                    const data = job.data;
                    await walletService.callFlutterwaveWalletCreation(data.userId, data.walletData);
                    logger_service_1.default.info("Completed CREATE_USER_WALLET job", { jobId: job.id });
                    break;
                default:
                    throw new Error(`Unknown job name: ${job.name}`);
            }
        });
    }
    catch (error) {
        logger_service_1.default.error("Error starting wallet worker", { error });
    }
};
exports.startWalletWorker = startWalletWorker;
//# sourceMappingURL=wallet.worker.js.map