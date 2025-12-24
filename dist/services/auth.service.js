"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const passport_1 = __importDefault(require("passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_jwt_1 = require("passport-jwt");
const env_1 = require("../config/env");
const index_1 = require("../managers/index");
const user_usecase_1 = __importDefault(require("../usecases/user.usecase"));
const crypto_1 = require("crypto");
const mail_service_1 = __importDefault(require("./mail.service"));
const error_manager_1 = require("../managers/error.manager");
const logger_service_1 = __importDefault(require("./logger.service"));
const cache_service_1 = __importDefault(require("./cache.service"));
class AuthService {
    constructor() {
        this.auth = (req, res, next) => {
            const authReq = req;
            passport_1.default.authenticate("jwt", { session: false }, (err, user) => {
                if (err || !user) {
                    return index_1.responseManager.unauthorized(res, "Unauthorised user");
                }
                authReq.user = user;
                authReq.token = req.headers.authorization?.split(" ")[1] || "";
                console.log(authReq.user);
                next();
            })(req, res, next);
        };
        this.mailService = new mail_service_1.default();
        this.cacheService = new cache_service_1.default();
        this.JWT_SECRET = env_1.env.JWT_SECRET;
        this.userUseCase = new user_usecase_1.default();
        this.opts = {
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: this.JWT_SECRET,
        };
        passport_1.default.use(new passport_jwt_1.Strategy(this.opts, async (jwtpayload, done) => {
            try {
                // User IDs are UUID strings; no numeric coercion
                if (!jwtpayload.id || !jwtpayload.email) {
                    return done(null, false);
                }
                return done(null, {
                    id: jwtpayload.id,
                    email: jwtpayload.email,
                });
            }
            catch (error) {
                return done(error, false);
            }
        }));
    }
    generateToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
        };
        return jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, { expiresIn: "30m" });
    }
    generateRefreshToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
        };
        return jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, { expiresIn: "7d" });
    }
    async createAuthTokens(user) {
        const accessToken = this.generateToken(user);
        const refreshToken = this.generateRefreshToken(user);
        return { accessToken, refreshToken };
    }
    // Refresh access token using refresh token (pure JWT)
    async refreshAccessToken(refreshToken) {
        try {
            // Verify the refresh token
            const decoded = jsonwebtoken_1.default.verify(refreshToken, this.JWT_SECRET);
            if (!decoded.id || !decoded.email) {
                return null;
            }
            // Verify user still exists in database
            const user = await this.userUseCase.getUserById(decoded.id);
            if (!user || !user.id || !user.email) {
                return null;
            }
            // Generate new tokens
            const authenticatedUser = { id: user.id, email: user.email };
            const newAccessToken = this.generateToken(authenticatedUser);
            const newRefreshToken = this.generateRefreshToken(authenticatedUser);
            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        }
        catch (error) {
            // Token invalid or expired
            return null;
        }
    }
    async validateOtpOnAccess(email) {
        if (!email) {
            throw new error_manager_1.BadRequestError("Email is required");
        }
        await this.sendOTPEmail(email);
        return { otp: "****" };
    }
    // Helper method to invalidate user cache (call when user data changes)
    async invalidateUserCache(userId) {
        const cacheKey = `user_${userId}`;
        await this.cacheService.del(cacheKey);
    }
    generateOTP() {
        return `${(0, crypto_1.randomInt)(100000, 1000000)}`;
    }
    async sendOTPEmail(email, ttlSeconds = 60) {
        let otp = this.generateOTP();
        // Hardcode OTP for load testing
        // if (email.startsWith('test') || email === 'test@example.com') {
        //   otp = '123456';
        // }
        console.log(otp);
        const emailStartTime = Date.now();
        try {
            await this.mailService.sendMail({
                to: email,
                subject: "Your OTP Code",
                text: `Your OTP code is ${otp}`,
                html: `<p>Your OTP code is <strong>${otp}</strong></p>`,
            });
            const emailDuration = Date.now() - emailStartTime;
            logger_service_1.default.logEmail(email, "Your OTP Code", true, emailDuration);
        }
        catch (error) {
            const emailDuration = Date.now() - emailStartTime;
            logger_service_1.default.logEmail(email, "Your OTP Code", false, emailDuration, error);
            throw error;
        }
        await this.cacheService.set(`otp_${email}`, otp, ttlSeconds);
    }
    async validateOTP(email, otp) {
        const cachedOtp = await this.cacheService.get(`otp_${email}`);
        if (cachedOtp === otp) {
            await this.cacheService.del(`otp_${email}`);
            return true;
        }
        return false;
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map