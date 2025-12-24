"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const middleware_1 = __importDefault(require("./middleware"));
const prisma_1 = require("./db/prisma");
const logger_service_1 = __importDefault(require("./services/logger.service"));
const providers_1 = require("./providers");
const engine_1 = __importDefault(require("./engine"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
// Start server
async function startServer() {
    try {
        // Connect to database first
        await (0, prisma_1.connectDatabase)();
        //initialize and comnnect to redis
        logger_service_1.default.info("Initializing Redis connection...");
        await providers_1.redisConfig.connect();
        logger_service_1.default.info("Redis connected successfully");
        // Start background workers
        (0, engine_1.default)().catch((error) => {
            logger_service_1.default.error("Error setting up workers:", error);
        });
        middleware_1.default.getApp().listen(PORT, () => {
            logger_service_1.default.info(`Server running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        logger_service_1.default.error("Failed to start server:", error);
        process.exit(1);
    }
}
startServer();
// Graceful shutdown
process.on("SIGINT", async () => {
    logger_service_1.default.info("\nShutting down gracefully...");
    await (0, prisma_1.disconnectDatabase)();
    process.exit(0);
});
//# sourceMappingURL=app.js.map