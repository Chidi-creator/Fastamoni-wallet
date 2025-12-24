import { QueueNames } from "@config/constants";
import QueueService from "@services/queue.service";

const queueService = new QueueService();

export const transactionQueue = queueService.createQueue(QueueNames.TRANSACTION_QUEUE);