"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("@config/env");
const nodemailer = __importStar(require("nodemailer"));
const error_manager_1 = require("@managers/error.manager");
const constants_1 = require("@config/constants");
class NodemailerConfig {
    constructor() {
        this.config = constants_1.nodeMailerConfig;
        this.transporter = nodemailer.createTransport(this.config);
    }
    async sendMail(mailOptions) {
        try {
            const mailBody = {
                from: env_1.env.MAIL_USER,
                to: mailOptions.to,
                subject: mailOptions.subject,
                text: mailOptions.text,
                html: mailOptions.html,
            };
            await this.transporter.sendMail(mailBody);
        }
        catch (error) {
            console.log(error);
            throw new error_manager_1.ProviderError("Failed to send email");
        }
    }
}
NodemailerConfig.getInstance = () => {
    if (!NodemailerConfig.instance) {
        NodemailerConfig.instance = new NodemailerConfig();
    }
    return NodemailerConfig.instance;
};
exports.default = NodemailerConfig;
//# sourceMappingURL=nodemailer.js.map