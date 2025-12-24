"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAccountCreation = void 0;
const joi_1 = __importDefault(require("joi"));
const validateAccountCreation = (object) => {
    const schema = joi_1.default.object({
        account_number: joi_1.default.string().required(),
        bank_code: joi_1.default.string().required(),
    });
    return schema.validate(object);
};
exports.validateAccountCreation = validateAccountCreation;
//# sourceMappingURL=account.js.map