import { Request } from "express";

export interface AuthenticatedUser {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  token: string;
  iat?: number;
  exp?: number;
}

export interface ILoginRequest {
  email: string;
  otp?: string;
}
