"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    DATABASE_URL: process.env.DATABASE_URL,
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASS: process.env.MAIL_PASS,
    MAIL_HOST: process.env.MAIL_HOST,
    JWT_SECRET: process.env.JWT_SECRET,
    MAIL_PORT: Number(process.env.MAIL_PORT),
    MAIL_SECURE: process.env.MAIL_SECURE === "true",
    MAIL_SERVICE: process.env.MAIL_SERVICE,
    FLUTTERWAVE_SANDBOX_SECRET_KEY: process.env.FLUTTERWAVE_SANDBOX_SECRET_KEY,
    FLUTTERWAVE_WEBHOOK_SECRET: process.env.FLUTTERWAVE_WEBHOOK_SECRET,
    JWT_ACCESS_TOKEN_EXPIRES_IN: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    JWT_REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: Number(process.env.REDIS_PORT),
    REDIS_USERNAME: process.env.REDIS_USERNAME,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
};
//# sourceMappingURL=env.js.map