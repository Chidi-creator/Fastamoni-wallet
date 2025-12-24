"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JOBS = exports.QueueNames = exports.nodeMailerConfig = exports.TransactionStatus = void 0;
const env_1 = require("./env");
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["FAILED"] = "FAILED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
exports.nodeMailerConfig = {
    host: env_1.env.MAIL_HOST,
    port: env_1.env.MAIL_PORT,
    secure: env_1.env.MAIL_SECURE,
    auth: {
        user: env_1.env.MAIL_USER,
        pass: env_1.env.MAIL_PASS,
    },
};
var QueueNames;
(function (QueueNames) {
    QueueNames["EMAIL_QUEUE"] = "email-queue";
    QueueNames["WALLET_QUEUE"] = "wallet-queue";
    QueueNames["TRANSACTION_QUEUE"] = "transaction-queue";
})(QueueNames || (exports.QueueNames = QueueNames = {}));
var JOBS;
(function (JOBS) {
    JOBS["CREATE_USER_WALLET"] = "create-user-wallet";
    JOBS["PROCESS_WEBHOOK"] = "process-webhook";
    JOBS["PROCESS_DONATION_TRANSFER"] = "process-donation-transfer";
    JOBS["PROCESS_BANK_TRANSFER"] = "process-bank-transfer";
})(JOBS || (exports.JOBS = JOBS = {}));
//# sourceMappingURL=constants.js.map