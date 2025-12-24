"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const middleware_1 = __importDefault(require("./middleware"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const passport_1 = __importDefault(require("passport"));
const logger_middleware_1 = __importDefault(require("./logger.middleware"));
const user_delivery_1 = __importDefault(require("@deliverymen/user.delivery"));
const auth_delivery_1 = __importDefault(require("@deliverymen/auth.delivery"));
const bank_delivery_1 = __importDefault(require("@deliverymen/bank.delivery"));
const account_delivery_1 = __importDefault(require("@deliverymen/account.delivery"));
const transaction_delivery_1 = __importDefault(require("@deliverymen/transaction.delivery"));
const app = (0, express_1.default)();
const middleware = new middleware_1.default(app);
const setUpRoutes = (middleware) => {
    // Healthcheck route
    middleware.addMiddleware("/healthcheck", (req, res) => {
        res.status(200).send("fastamoni Server is up and running!");
    });
    middleware.addMiddleware("/users", user_delivery_1.default);
    middleware.addMiddleware("/auth", auth_delivery_1.default);
    middleware.addMiddleware("/accounts", account_delivery_1.default);
    middleware.addMiddleware("/banks", bank_delivery_1.default);
    // Mount transaction routes under /transactions and also at root to keep webhook path stable
    middleware.addMiddleware("/transactions", transaction_delivery_1.default);
    middleware.addMiddleware("/", transaction_delivery_1.default);
};
const setUpMiddleware = () => {
    middleware.addMiddleware((0, helmet_1.default)());
    middleware.addMiddleware((0, cors_1.default)());
    middleware.addMiddleware(express_1.default.json());
    // Add request logging middleware
    middleware.addMiddleware(logger_middleware_1.default);
    middleware.addMiddleware(passport_1.default.initialize());
    setUpRoutes(middleware);
};
setUpMiddleware();
exports.default = middleware;
//# sourceMappingURL=index.js.map