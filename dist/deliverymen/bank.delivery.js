"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bank_handler_1 = __importDefault(require("@handlers/bank.handler"));
const auth_service_1 = require("@services/auth.service");
const router = express_1.default.Router();
const authService = new auth_service_1.AuthService();
const bankHandler = new bank_handler_1.default();
router.route("/").get([authService.auth], bankHandler.getAllBanks);
exports.default = router;
//# sourceMappingURL=bank.delivery.js.map