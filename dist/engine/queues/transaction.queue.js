"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionQueue = void 0;
const constants_1 = require("@config/constants");
const queue_service_1 = __importDefault(require("@services/queue.service"));
const queueService = new queue_service_1.default();
exports.transactionQueue = queueService.createQueue(constants_1.QueueNames.TRANSACTION_QUEUE);
//# sourceMappingURL=transaction.queue.js.map