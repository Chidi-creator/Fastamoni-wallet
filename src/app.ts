import express, { Express } from "express";
import dotenv from "dotenv";
import middleware from "./middleware";
import { connectDatabase, disconnectDatabase } from "./db/prisma";
import logger from "@services/logger.service";
import { redisConfig } from "./providers";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Start server
async function startServer() {
  try {
    // Connect to database first
    await connectDatabase();

    //initialize and comnnect to redis
    logger.info("Initializing Redis connection...");
    await redisConfig.connect();
    logger.info("Redis connected successfully");

    middleware.getApp().listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("\nShutting down gracefully...");
  await disconnectDatabase();
  process.exit(0);
});
