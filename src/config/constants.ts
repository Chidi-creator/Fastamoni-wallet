import { NodeMailerConfigType } from "@providers/notifications/types/email";
import { env } from "./env";

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export const nodeMailerConfig: NodeMailerConfigType = {
  host: env.MAIL_HOST,
  port: env.MAIL_PORT,
  secure: env.MAIL_SECURE,
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASS,
  },
};

export enum QueueNames {
  EMAIL_QUEUE = "email-queue",
  WALLET_QUEUE = "wallet-queue",
  TRANSACTION_QUEUE = "transaction-queue",
}

export enum JOBS {
  CREATE_USER_WALLET = "create-user-wallet",
}