import { QueueNames } from "@config/constants";
import QueueService from "@services/queue.service";

const queueService = new QueueService();

 export const walletQueue = queueService.createQueue(QueueNames.WALLET_QUEUE);
