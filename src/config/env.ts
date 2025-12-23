import { EnvConfig } from "./types/env";
import dotenv from "dotenv";

dotenv.config();

export const env: EnvConfig = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  MAIL_USER: process.env.MAIL_USER as string,
  MAIL_PASS: process.env.MAIL_PASS as string,
  MAIL_HOST: process.env.MAIL_HOST as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  MAIL_PORT: Number(process.env.MAIL_PORT),
  MAIL_SECURE: process.env.MAIL_SECURE === "true",
  MAIL_SERVICE: process.env.MAIL_SERVICE as string,
  FLUTTERWAVE_SANDBOX_SECRET_KEY: process.env.FLUTTERWAVE_SANDBOX_SECRET_KEY as string,
  FLUTTERWAVE_WEBHOOK_SECRET: process.env.FLUTTERWAVE_WEBHOOK_SECRET as string,
  JWT_ACCESS_TOKEN_EXPIRES_IN: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN as string,
  JWT_REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN as string,
  REDIS_HOST: process.env.REDIS_HOST as string,
  REDIS_PORT: Number(process.env.REDIS_PORT),
  REDIS_USERNAME: process.env.REDIS_USERNAME as string,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
};
