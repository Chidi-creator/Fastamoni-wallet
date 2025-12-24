import { JOBS, QueueNames } from "@config/constants";
import logger from "@services/logger.service";
import QueueService from "@services/queue.service";
import TransactionService from "@services/transaction.service";

const queueService = new QueueService();
const transactionService = new TransactionService();

export const startTransactionWorker = async () => {
  try {
    await queueService.createWorker(QueueNames.TRANSACTION_QUEUE, async (job) => {
      switch (job.name) {
        case JOBS.PROCESS_WEBHOOK:
          logger.info("Processing PROCESS_WEBHOOK job", {
            jobId: job.id,
            data: job.data,
          });
          const data = job.data as {
            body: any;
            headers: Record<string, any>;
          };
          await transactionService.handleFlutterwaveWebhook(data.body, data.headers);
          logger.info("Completed PROCESS_WEBHOOK job", { jobId: job.id });
          break;
        case JOBS.PROCESS_DONATION_TRANSFER:
          logger.info("Processing PROCESS_DONATION_TRANSFER job", {
            jobId: job.id,
            data: job.data,
          });
          const donationData = job.data as {
            payload: any;
            donorUserId: string;
            idempotencyKey?: string;
          };
          await transactionService.handleDonationTransfer(donationData.payload, donationData.donorUserId, donationData.idempotencyKey);
          logger.info("Completed PROCESS_DONATION_TRANSFER job", { jobId: job.id });
          break;
        case JOBS.PROCESS_BANK_TRANSFER:
          logger.info("Processing PROCESS_BANK_TRANSFER job", {
            jobId: job.id,
            data: job.data,
          });
          const bankData = job.data as {
            payload: any;
            userId: string;
            idempotencyKey?: string;
          };
          await transactionService.initiateBankTransfer(bankData.payload, bankData.userId, bankData.idempotencyKey);
          logger.info("Completed PROCESS_BANK_TRANSFER job", { jobId: job.id });
          break;
        default:
          throw new Error(`Unknown job name: ${job.name}`);
      }
    });
  } catch (error) {
    logger.error("Error starting transaction worker", { error });
  }
};