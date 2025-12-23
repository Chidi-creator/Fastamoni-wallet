import { EnvConfig } from "./types/env";
import dotenv from "dotenv";

dotenv.config();

export const env: EnvConfig = {
    DATABASE_URL: process.env.DATABASE_URL as string,
};
