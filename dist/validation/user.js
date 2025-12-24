"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserUpdate = exports.validateUserCreation = void 0;
const joi_1 = __importDefault(require("joi"));
const validateUserCreation = (object) => {
    const schema = joi_1.default.object({
        firstname: joi_1.default.string().min(2).max(30).required(),
        lastname: joi_1.default.string().min(2).max(30).required(),
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(5).required(),
    });
    return schema.validate(object);
};
exports.validateUserCreation = validateUserCreation;
const validateUserUpdate = (object) => {
    const schema = joi_1.default.object({
        firstname: joi_1.default.string().min(2).max(30).optional(),
        lastname: joi_1.default.string().min(2).max(30).optional(),
        email: joi_1.default.string().email().optional(),
        password: joi_1.default.string().min(6).optional(),
    });
    return schema.validate(object);
};
exports.validateUserUpdate = validateUserUpdate;
//# sourceMappingURL=user.js.map