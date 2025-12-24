"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bullMqConfig = exports.flutterwaveWalletProvider = exports.flutterwaveBankResolver = exports.redisConfig = exports.nodemailerConfig = void 0;
const nodemailer_1 = __importDefault(require("./notifications/nodemailer"));
const redis_1 = __importDefault(require("./cache/redis"));
const flutterwave_1 = __importDefault(require("./wallet/flutterwave"));
const flutterwave_2 = __importDefault(require("./bankAccounts/flutterwave"));
const bullmq_1 = __importDefault(require("./Queue/bullmq"));
exports.nodemailerConfig = nodemailer_1.default.getInstance();
exports.redisConfig = redis_1.default.getInstance();
exports.flutterwaveBankResolver = flutterwave_2.default.getInstance();
exports.flutterwaveWalletProvider = flutterwave_1.default.getInstance();
exports.bullMqConfig = bullmq_1.default.getInstance();
//# sourceMappingURL=index.js.map