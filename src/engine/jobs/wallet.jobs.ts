import logger from "@services/logger.service";
import { walletQueue } from "engine/queues/wallet.queue";

export const addWalletJobs = async (jobName: string, data: any) => {
  try {
    const queue = await walletQueue;
    await queue.add(jobName, data, {
      attempts: 2,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 10,
      removeOnFail: 5,
    });
  } catch (error: any) {
    logger.error("Error adding wallet job to queue", {
      error: error.message,
      jobName,
      data,
    });
  }
};
