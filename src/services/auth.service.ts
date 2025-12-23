import passport from "passport";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from "passport-jwt";
import {
  AuthenticatedRequest,
  AuthenticatedUser,
  ILoginRequest,
} from "./types/auth";
import { env } from "@config/env";
import { responseManager } from "@managers/index";
import UserUseCases from "@usecases/user.usecase";
import { randomInt } from "crypto";
import { EmailOptions } from "@providers/notifications/types/email";
import MailService from "./mail.service";

import { Token } from "typescript";
import { BadRequestError, ValidationError } from "@managers/error.manager";
import logger from "./logger.service";
import CacheService from "./cache.service";

export class AuthService {
  private JWT_SECRET: string;
  private opts: StrategyOptions;
  private userUseCase: UserUseCases;
  private mailService: MailService;
  private cacheService: CacheService    ;

  constructor() {
    this.mailService = new MailService();
    this.cacheService = new CacheService();
    this.JWT_SECRET = env.JWT_SECRET;
    this.userUseCase = new UserUseCases();
    this.opts = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: this.JWT_SECRET,
    };

    passport.use(
      new JwtStrategy(
        this.opts,
        async (jwtpayload: AuthenticatedUser, done) => {
          try {
            // User IDs are UUID strings; no numeric coercion
            if (!jwtpayload.id || !jwtpayload.email) {
              return done(null, false);
            }

            return done(null, {
              id: jwtpayload.id,
              email: jwtpayload.email,
            });
          } catch (error) {
            return done(error, false);
          }
        }
      )
    );
  }
  public auth = (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    passport.authenticate(
      "jwt",
      { session: false },
      (err: any, user: AuthenticatedUser) => {
        if (err || !user) {
          return responseManager.unauthorized(res, "Unauthorised user");
        }
      
        authReq.user = user;
        authReq.token = req.headers.authorization?.split(" ")[1] || "";
          console.log(authReq.user);
        next();
      }
    )(req, res, next);
  };

  public generateToken(user: AuthenticatedUser): string {
    const payload = {
      id: user.id,
      email: user.email,
    };

    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: "30m" });
  }

  public generateRefreshToken(user: AuthenticatedUser): string {
    const payload = {
      id: user.id,
      email: user.email,
    };

    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: "7d" });
  }

  public async createAuthTokens(user: AuthenticatedUser): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  // Refresh access token using refresh token (pure JWT)
  public async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> {
    try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET) as any;
      
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
    } catch (error) {
      // Token invalid or expired
      return null;
    }
  }

  async validateOtpOnAccess(email: string): Promise<{ otp: string }> {
    if (!email) {
      throw new BadRequestError("Email is required");
    }
    await this.sendOTPEmail(email);
    return { otp: "****" };
  }


  // Helper method to invalidate user cache (call when user data changes)
  public async invalidateUserCache(userId: number): Promise<void> {
    const cacheKey = `user_${userId}`;
    await this.cacheService.del(cacheKey);
  }

  private generateOTP(): string {
    return `${randomInt(100000, 1000000)}`;
  }

  async sendOTPEmail(email: string, ttlSeconds = 60): Promise<void> {
    const otp = this.generateOTP();
    console.log(otp)

    const emailStartTime = Date.now();
    try {
      await this.mailService.sendMail({
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}`,
        html: `<p>Your OTP code is <strong>${otp}</strong></p>`,
      });
      const emailDuration = Date.now() - emailStartTime;
      logger.logEmail(email, "Your OTP Code", true, emailDuration);
    } catch (error) {
      const emailDuration = Date.now() - emailStartTime;
      logger.logEmail(
        email,
        "Your OTP Code",
        false,
        emailDuration,
        error as Error
      );
      throw error;
    }

    await this.cacheService.set(`otp_${email}`, otp, ttlSeconds)
  }

  async validateOTP(email: string, otp: string): Promise<boolean> {
    const cachedOtp = await this.cacheService.get<string>(`otp_${email}`);

    if (cachedOtp === otp) {
      await this.cacheService.del(`otp_${email}`);
      return true;
    }

    return false;
  }
}
