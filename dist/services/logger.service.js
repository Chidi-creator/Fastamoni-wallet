"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.LoggerService = void 0;
const winston_1 = __importDefault(require("winston"));
class LoggerService {
    constructor() {
        const customFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.colorize(), winston_1.default.format.printf(({ timestamp, level, message, stack, ...meta }) => {
            let log = `${timestamp} [${level}]: ${message}`;
            if (stack) {
                log += `\n${stack}`;
            }
            if (Object.keys(meta).length > 0) {
                log += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
            }
            return log;
        }));
        this.logger = winston_1.default.createLogger({
            level: process.env.NODE_ENV === "production" ? "info" : "debug",
            format: customFormat,
            transports: [
                new winston_1.default.transports.Console({
                    level: "debug",
                }),
                new winston_1.default.transports.File({
                    filename: "logs/error.log",
                    level: "error",
                    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
                }),
                new winston_1.default.transports.File({
                    filename: "logs/combined.log",
                    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
                }),
            ],
        });
        this.ensureLogsDirectory();
    }
    ensureLogsDirectory() {
        const fs = require("fs");
        const path = require("path");
        const logsDir = path.join(process.cwd(), "logs");
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
    }
    // HTTP Request logging
    logRequest(method, url, statusCode, responseTime, userId) {
        const message = `${method} ${url}`;
        this.logger.info(message, { statusCode, responseTime, userId });
    }
    // Authentication logging
    logAuth(action, email, success, details) {
        const message = `Auth: ${action} - ${email} - ${success ? "SUCCESS" : "FAILED"}`;
        this.logger.info(message, details || {});
    }
    // Performance logging
    logPerformance(operation, duration, details) {
        const message = `Performance: ${operation} took ${duration}ms`;
        this.logger.info(message, details || {});
    }
    // Database operation logging
    logDatabase(operation, table, duration, error) {
        const message = `DB: ${operation} on ${table}`;
        if (error) {
            this.logger.error(message, { error: error.message, stack: error.stack, duration });
        }
        else {
            this.logger.info(message, { duration });
        }
    }
    logEmail(to, subject, success, duration, error) {
        const message = `Email: ${subject} to ${to} - ${success ? "SENT" : "FAILED"}`;
        if (error) {
            this.logger.error(message, { error: error.message, duration });
        }
        else {
            this.logger.info(message, { duration });
        }
    }
    info(message, meta) {
        this.logger.info(message, meta || {});
    }
    error(message, error, meta) {
        if (error instanceof Error) {
            this.logger.error(message, {
                error: error.message,
                stack: error.stack,
                ...meta
            });
        }
        else if (error) {
            this.logger.error(message, { error, ...meta });
        }
        else {
            this.logger.error(message, meta || {});
        }
    }
    warn(message, meta) {
        this.logger.warn(message, meta || {});
    }
    debug(message, meta) {
        this.logger.debug(message, meta || {});
    }
    logTransaction(type, amount, userId, status, details) {
        const message = `Transaction: ${type} - ₦${amount} - User ${userId} - ${status}`;
        if (status === "FAILED") {
            this.logger.error(message, { type, amount, userId, status, ...details });
        }
        else {
            this.logger.info(message, { type, amount, userId, status, ...details });
        }
    }
    logUserAction(userId, action, details) {
        const message = `User Action: ${action} - User ${userId}`;
        this.logger.info(message, { userId, action, ...details });
    }
}
exports.LoggerService = LoggerService;
// Create singleton instance
exports.logger = new LoggerService();
exports.default = exports.logger;
//# sourceMappingURL=logger.service.js.map