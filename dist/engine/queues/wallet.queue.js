"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletQueue = void 0;
const constants_1 = require("../../config/constants");
const queue_service_1 = __importDefault(require("../../services/queue.service"));
const queueService = new queue_service_1.default();
exports.walletQueue = queueService.createQueue(constants_1.QueueNames.WALLET_QUEUE);
//# sourceMappingURL=wallet.queue.js.map