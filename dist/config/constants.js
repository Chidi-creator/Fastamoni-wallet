"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeMailerConfig = exports.TransactionStatus = void 0;
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
//# sourceMappingURL=constants.js.map