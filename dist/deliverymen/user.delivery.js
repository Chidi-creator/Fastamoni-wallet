"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_handler_1 = __importDefault(require("@handlers/user.handler"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const userHandler = new user_handler_1.default();
router.route("/register").post(userHandler.handleCreateUser);
exports.default = router;
//# sourceMappingURL=user.delivery.js.map