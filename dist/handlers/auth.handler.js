"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const index_1 = require("../managers/index");
const auth_service_1 = require("../services/auth.service");
const user_usecase_1 = __importDefault(require("../usecases/user.usecase"));
class AuthHandler {
    constructor() {
        // Step 1: verify credentials, send OTP, return email handle
        this.login = async (req, res) => {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return index_1.responseManager.validationError(res, "Email and password are required");
                }
                const user = await this.userUseCase.getUserByEmail(email);
                if (!user || !user.password) {
                    return index_1.responseManager.unauthorized(res, "Invalid credentials");
                }
                const isMatch = await bcrypt_1.default.compare(password, user.password);
                if (!isMatch) {
                    return index_1.responseManager.unauthorized(res, "Invalid credentials");
                }
                // Cache OTP for 30 seconds keyed by email and email it to the user
                await this.authService.sendOTPEmail(user.email, 30);
                return index_1.responseManager.success(res, { email: user.email }, "OTP sent to email", 200);
            }
            catch (error) {
                return index_1.responseManager.handleError(res, error);
            }
        };
        // Step 2: verify OTP, then return tokens and user profile
        this.verifyOtpAndIssueTokens = async (req, res) => {
            try {
                const { email, otp } = req.body;
                if (!email || !otp) {
                    return index_1.responseManager.validationError(res, "Email and OTP are required");
                }
                const isValidOtp = await this.authService.validateOTP(email, otp);
                if (!isValidOtp) {
                    return index_1.responseManager.unauthorized(res, "Invalid or expired OTP");
                }
                const user = await this.userUseCase.getUserByEmail(email);
                if (!user) {
                    return index_1.responseManager.unauthorized(res, "User not found");
                }
                const tokens = await this.authService.createAuthTokens({
                    id: user.id,
                    email: user.email,
                });
                return index_1.responseManager.success(res, { user: this.sanitizeUser(user), ...tokens }, "Login successful", 200);
            }
            catch (error) {
                return index_1.responseManager.handleError(res, error);
            }
        };
        this.authService = new auth_service_1.AuthService();
        this.userUseCase = new user_usecase_1.default();
    }
    sanitizeUser(user) {
        const { password, deletedAt, ...safe } = user;
        return safe;
    }
}
exports.default = AuthHandler;
//# sourceMappingURL=auth.handler.js.map