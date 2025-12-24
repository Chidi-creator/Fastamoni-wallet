"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_service_1 = __importDefault(require("@services/logger.service"));
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    req.startTime = startTime;
    // Log incoming request - skip in load tests to reduce I/O overhead
    if (process.env.LOAD_TEST_MODE !== 'true') {
        logger_service_1.default.info(`${req.method} ${req.originalUrl}`);
    }
    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const responseTime = Date.now() - startTime;
        // Log the response
        // Log the response - skip in load tests
        if (process.env.LOAD_TEST_MODE !== 'true') {
            logger_service_1.default.logRequest(req.method, req.originalUrl, res.statusCode, responseTime);
        }
        // Call original end method and return its result
        return originalEnd.call(this, chunk, encoding);
    };
    next();
};
exports.requestLogger = requestLogger;
exports.default = exports.requestLogger;
//# sourceMappingURL=logger.middleware.js.map