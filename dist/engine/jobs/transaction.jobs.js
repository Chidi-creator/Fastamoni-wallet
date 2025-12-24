"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBankTransferJob = exports.addDonationTransferJob = exports.addWebhookJob = void 0;
const constants_1 = require("../../config/constants");
const logger_service_1 = __importDefault(require("../../services/logger.service"));
const transaction_queue_1 = require("../queues/transaction.queue");
const addWebhookJob = async (data) => {
    try {
        const queue = await transaction_queue_1.transactionQueue;
        await queue.add(constants_1.JOBS.PROCESS_WEBHOOK, data, {
            attempts: 3,
            backoff: { type: "exponential", delay: 2000 },
            removeOnComplete: 10,
            removeOnFail: 5,
        });
    }
    catch (error) {
        logger_service_1.default.error("Error adding webhook job to queue", {
            error: error.message,
            data,
        });
    }
};
exports.addWebhookJob = addWebhookJob;
const addDonationTransferJob = async (data) => {
    try {
        const queue = await transaction_queue_1.transactionQueue;
        await queue.add(constants_1.JOBS.PROCESS_DONATION_TRANSFER, data, {
            attempts: 3,
            backoff: { type: "exponential", delay: 2000 },
            removeOnComplete: 10,
            removeOnFail: 5,
        });
    }
    catch (error) {
        logger_service_1.default.error("Error adding donation transfer job to queue", {
            error: error.message,
            data,
        });
    }
};
exports.addDonationTransferJob = addDonationTransferJob;
const addBankTransferJob = async (data) => {
    try {
        const queue = await transaction_queue_1.transactionQueue;
        await queue.add(constants_1.JOBS.PROCESS_BANK_TRANSFER, data, {
            attempts: 3,
            backoff: { type: "exponential", delay: 2000 },
            removeOnComplete: 10,
            removeOnFail: 5,
        });
    }
    catch (error) {
        logger_service_1.default.error("Error adding bank transfer job to queue", {
            error: error.message,
            data,
        });
    }
};
exports.addBankTransferJob = addBankTransferJob;
//# sourceMappingURL=transaction.jobs.js.map