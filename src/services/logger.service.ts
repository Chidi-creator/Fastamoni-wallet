import winston from "winston";

export class LoggerService {
  private logger: winston.Logger;

  constructor() {
 
    const customFormat = winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.errors({ stack: true }),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;

        if (stack) {
          log += `\n${stack}`;
        }

        if (Object.keys(meta).length > 0) {
          log += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
        }

        return log;
      })
    );

    this.logger = winston.createLogger({
      level: process.env.NODE_ENV === "production" ? "info" : "debug",
      format: customFormat,
      transports: [
        new winston.transports.Console({
          level: "debug",
        }),

        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),

        new winston.transports.File({
          filename: "logs/combined.log",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
      ],
    });

    this.ensureLogsDirectory();
  }

  private ensureLogsDirectory() {
    const fs = require("fs");
    const path = require("path");
    const logsDir = path.join(process.cwd(), "logs");

    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  // HTTP Request logging
  public logRequest(
    method: string,
    url: string,
    statusCode?: number,
    responseTime?: number,
    userId?: number
  ) {
    const message = `${method} ${url}`;
    this.logger.info(message, { statusCode, responseTime, userId });
  }

  // Authentication logging
  public logAuth(
    action: string,
    email: string,
    success: boolean,
    details?: any
  ) {
    const message = `Auth: ${action} - ${email} - ${
      success ? "SUCCESS" : "FAILED"
    }`;
    this.logger.info(message, details || {});
  }

  // Performance logging
  public logPerformance(operation: string, duration: number, details?: any) {
    const message = `Performance: ${operation} took ${duration}ms`;
    this.logger.info(message, details || {});
  }

  // Database operation logging
  public logDatabase(
    operation: string,
    table: string,
    duration?: number,
    error?: Error
  ) {
    const message = `DB: ${operation} on ${table}`;

    if (error) {
      this.logger.error(message, { error: error.message, stack: error.stack, duration });
    } else {
      this.logger.info(message, { duration });
    }
  }

  public logEmail(
    to: string,
    subject: string,
    success: boolean,
    duration?: number,
    error?: Error
  ) {
    const message = `Email: ${subject} to ${to} - ${
      success ? "SENT" : "FAILED"
    }`;

    if (error) {
      this.logger.error(message, { error: error.message, duration });
    } else {
      this.logger.info(message, { duration });
    }
  }

  public info(message: string, meta?: any) {
    this.logger.info(message, meta || {});
  }

  public error(message: string, error?: Error | any, meta?: any) {
    if (error instanceof Error) {
      this.logger.error(message, { 
        error: error.message, 
        stack: error.stack,
        ...meta 
      });
    } else if (error) {
      this.logger.error(message, { error, ...meta });
    } else {
      this.logger.error(message, meta || {});
    }
  }

  public warn(message: string, meta?: any) {
    this.logger.warn(message, meta || {});
  }

  public debug(message: string, meta?: any) {
    this.logger.debug(message, meta || {});
  }

  public logTransaction(
    type: string,
    amount: number,
    userId: number,
    status: string,
    details?: any
  ) {
    const message = `Transaction: ${type} - ₦${amount} - User ${userId} - ${status}`;

    if (status === "FAILED") {
      this.logger.error(message, { type, amount, userId, status, ...details });
    } else {
      this.logger.info(message, { type, amount, userId, status, ...details });
    }
  }

  public logUserAction(userId: number, action: string, details?: any) {
    const message = `User Action: ${action} - User ${userId}`;
    this.logger.info(message, { userId, action, ...details });
  }
}

// Create singleton instance
export const logger = new LoggerService();
export default logger;
