"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("@providers/index");
const env_1 = require("@config/env");
const logger_service_1 = __importDefault(require("./logger.service"));
class MailService {
    async sendMail(mailOptions) {
        try {
            const mailBody = {
                from: env_1.env.MAIL_USER,
                to: mailOptions.to,
                subject: mailOptions.subject,
                text: mailOptions.text,
                html: mailOptions.html,
            };
            logger_service_1.default.info(`sending email to ${mailOptions.to}`);
            await index_1.nodemailerConfig.sendMail(mailBody);
        }
        catch (error) {
            logger_service_1.default.error(`unable to send email to ${mailOptions.to}:`, error);
        }
    }
}
exports.default = MailService;
//# sourceMappingURL=mail.service.js.map