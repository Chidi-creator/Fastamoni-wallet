import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { responseManager } from "@managers/index";
import { AuthService } from "@services/auth.service";
import UserUseCase from "@usecases/user.usecase";
import { User } from "@prisma/client";
import { ILoginRequest } from "@services/types/auth";

class AuthHandler {
	private authService: AuthService;
	private userUseCase: UserUseCase;

	constructor() {
		this.authService = new AuthService();
		this.userUseCase = new UserUseCase();
	}

	private sanitizeUser(user: User) {
		const { password, deletedAt, ...safe } = user;
		return safe;
	}

	// Step 1: verify credentials, send OTP, return email handle
	public login = async (req: Request, res: Response) => {
		try {
			const { email, password } = req.body as ILoginRequest;

			if (!email || !password) {
				return responseManager.validationError(res, "Email and password are required");
			}

			const user = await this.userUseCase.getUserByEmail(email);

			if (!user || !user.password) {
				return responseManager.unauthorized(res, "Invalid credentials");
			}

			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) {
				return responseManager.unauthorized(res, "Invalid credentials");
			}

			// Cache OTP for 30 seconds keyed by email and email it to the user
			await this.authService.sendOTPEmail(user.email, 30);

			return responseManager.success(
				res,
				{ email: user.email },
				"OTP sent to email",
				200
			);
		} catch (error: any) {
			return responseManager.handleError(res, error);
		}
	};

	// Step 2: verify OTP, then return tokens and user profile
	public verifyOtpAndIssueTokens = async (req: Request, res: Response) => {
		try {
			const { email, otp } = req.body as { email?: string; otp?: string };

			if (!email || !otp) {
				return responseManager.validationError(res, "Email and OTP are required");
			}

			const isValidOtp = await this.authService.validateOTP(email, otp);

			if (!isValidOtp) {
				return responseManager.unauthorized(res, "Invalid or expired OTP");
			}

			const user = await this.userUseCase.getUserByEmail(email);

			if (!user) {
				return responseManager.unauthorized(res, "User not found");
			}

			const tokens = await this.authService.createAuthTokens({
				id: user.id,
				email: user.email,
			});

			return responseManager.success(
				res,
				{ user: this.sanitizeUser(user), ...tokens },
				"Login successful",
				200
			);
		} catch (error: any) {
			return responseManager.handleError(res, error);
		}
	};
}

export default AuthHandler;
