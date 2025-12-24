import { JOBS, QueueNames } from "@config/constants";
import { CreateWalletRequest } from "@providers/wallet/types/wallet";
import logger from "@services/logger.service";
import QueueService from "@services/queue.service";
import WalletService from "@services/wallet.service";

const queueService = new QueueService();
const walletService = new WalletService();

export const startWalletWorker = async () => {
  try {
    await queueService.createWorker(QueueNames.WALLET_QUEUE, async (job) => {
      switch (job.name) {
        case JOBS.CREATE_USER_WALLET:
          logger.info("Processing CREATE_USER_WALLET job", {
            jobId: job.id,
            data: job.data,
          });
          const data = job.data as {
            userId: string;
            walletData: CreateWalletRequest;
          };
          await walletService.callFlutterwaveWalletCreation(
            data.userId,
            data.walletData
          );
          logger.info("Completed CREATE_USER_WALLET job", { jobId: job.id });
          break;
        default:
          throw new Error(`Unknown job name: ${job.name}`);
      }
    });
  } catch (error) {
    logger.error("Error starting wallet worker", { error });
  }
};
