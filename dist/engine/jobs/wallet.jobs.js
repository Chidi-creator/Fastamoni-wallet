"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addWalletJobs = void 0;
const logger_service_1 = __importDefault(require("../../services/logger.service"));
const wallet_queue_1 = require("../../engine/queues/wallet.queue");
const addWalletJobs = async (jobName, data) => {
    try {
        const queue = await wallet_queue_1.walletQueue;
        await queue.add(jobName, data, {
            attempts: 2,
            backoff: { type: "exponential", delay: 5000 },
            removeOnComplete: 10,
            removeOnFail: 5,
        });
    }
    catch (error) {
        logger_service_1.default.error("Error adding wallet job to queue", {
            error: error.message,
            jobName,
            data,
        });
    }
};
exports.addWalletJobs = addWalletJobs;
//# sourceMappingURL=wallet.jobs.js.map