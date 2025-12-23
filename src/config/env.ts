import { EnvConfig } from "./types/env";
import dotenv from "dotenv";

dotenv.config();

export const env: EnvConfig = {
  DATABASE_URL: process.env.DATABASE_URL as string,
  MAIL_USER: process.env.MAIL_USER as string,
  MAIL_PASS: process.env.MAIL_PASS as string,
  MAIL_HOST: process.env.MAIL_HOST as string,
  MAIL_PORT: Number(process.env.MAIL_PORT),
  MAIL_SECURE: process.env.MAIL_SECURE === "true",
  MAIL_SERVICE: process.env.MAIL_SERVICE as string,
};
