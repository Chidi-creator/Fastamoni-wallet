import NodemailerConfig from "./notifications/nodemailer";
import RedisConfig from "./cache/redis";
import FlutterwaveWalletProvider from "./wallet/flutterwave";
import FlutterwaveBankResolver from "./bankAccounts/flutterwave";
import BullMQConfig from "./Queue/bullmq";

export const nodemailerConfig = NodemailerConfig.getInstance();
export const redisConfig = RedisConfig.getInstance();
export const flutterwaveBankResolver = FlutterwaveBankResolver.getInstance();
export const flutterwaveWalletProvider = FlutterwaveWalletProvider.getInstance();
export const bullMqConfig = BullMQConfig.getInstance();