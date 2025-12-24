"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_service_1 = require("../services/auth.service");
const account_handler_1 = __importDefault(require("../handlers/account.handler"));
const router = express_1.default.Router();
const authService = new auth_service_1.AuthService();
const accountHandler = new account_handler_1.default();
router.route("/resolve").post([authService.auth], accountHandler.createAccount);
router.route("/user").get([authService.auth], accountHandler.findUserAccountsById);
exports.default = router;
//# sourceMappingURL=account.delivery.js.map