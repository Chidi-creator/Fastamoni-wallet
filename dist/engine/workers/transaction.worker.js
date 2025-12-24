"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTransactionWorker = void 0;
const constants_1 = require("../../config/constants");
const logger_service_1 = __importDefault(require("../../services/logger.service"));
const queue_service_1 = __importDefault(require("../../services/queue.service"));
const transaction_service_1 = __importDefault(require("../../services/transaction.service"));
const queueService = new queue_service_1.default();
const transactionService = new transaction_service_1.default();
const startTransactionWorker = async () => {
    try {
        await queueService.createWorker(constants_1.QueueNames.TRANSACTION_QUEUE, async (job) => {
            switch (job.name) {
                case constants_1.JOBS.PROCESS_WEBHOOK:
                    logger_service_1.default.info("Processing PROCESS_WEBHOOK job", {
                        jobId: job.id,
                        data: job.data,
                    });
                    const data = job.data;
                    await transactionService.handleFlutterwaveWebhook(data.body, data.headers);
                    logger_service_1.default.info("Completed PROCESS_WEBHOOK job", { jobId: job.id });
                    break;
                case constants_1.JOBS.PROCESS_DONATION_TRANSFER:
                    logger_service_1.default.info("Processing PROCESS_DONATION_TRANSFER job", {
                        jobId: job.id,
                        data: job.data,
                    });
                    const donationData = job.data;
                    await transactionService.handleDonationTransfer(donationData.payload, donationData.donorUserId, donationData.idempotencyKey);
                    logger_service_1.default.info("Completed PROCESS_DONATION_TRANSFER job", { jobId: job.id });
                    break;
                case constants_1.JOBS.PROCESS_BANK_TRANSFER:
                    logger_service_1.default.info("Processing PROCESS_BANK_TRANSFER job", {
                        jobId: job.id,
                        data: job.data,
                    });
                    const bankData = job.data;
                    await transactionService.initiateBankTransfer(bankData.payload, bankData.userId, bankData.idempotencyKey);
                    logger_service_1.default.info("Completed PROCESS_BANK_TRANSFER job", { jobId: job.id });
                    break;
                default:
                    throw new Error(`Unknown job name: ${job.name}`);
            }
        });
    }
    catch (error) {
        logger_service_1.default.error("Error starting transaction worker", { error });
    }
};
exports.startTransactionWorker = startTransactionWorker;
//# sourceMappingURL=transaction.worker.js.map