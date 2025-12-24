import { JOBS } from "@config/constants";
import logger from "@services/logger.service";
import { transactionQueue } from "../queues/transaction.queue";

export const addWebhookJob = async (data: { body: any; headers: Record<string, any> }) => {
  try {
    const queue = await transactionQueue;
    await queue.add(JOBS.PROCESS_WEBHOOK, data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 10,
      removeOnFail: 5,
    });
  } catch (error: any) {
    logger.error("Error adding webhook job to queue", {
      error: error.message,
      data,
    });
  }
};

export const addDonationTransferJob = async (data: { payload: any; donorUserId: string; idempotencyKey?: string }) => {
  try {
    const queue = await transactionQueue;
    await queue.add(JOBS.PROCESS_DONATION_TRANSFER, data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 10,
      removeOnFail: 5,
    });
  } catch (error: any) {
    logger.error("Error adding donation transfer job to queue", {
      error: error.message,
      data,
    });
  }
};

export const addBankTransferJob = async (data: { payload: any; userId: string; idempotencyKey?: string }) => {
  try {
    const queue = await transactionQueue;
    await queue.add(JOBS.PROCESS_BANK_TRANSFER, data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 10,
      removeOnFail: 5,
    });
  } catch (error: any) {
    logger.error("Error adding bank transfer job to queue", {
      error: error.message,
      data,
    });
  }
};