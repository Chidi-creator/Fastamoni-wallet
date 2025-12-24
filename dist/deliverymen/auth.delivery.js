"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_handler_1 = __importDefault(require("../handlers/auth.handler"));
const router = express_1.default.Router();
const authHandler = new auth_handler_1.default();
router.route("/login").post(authHandler.login);
router.route("/verify-otp").post(authHandler.verifyOtpAndIssueTokens);
exports.default = router;
//# sourceMappingURL=auth.delivery.js.map