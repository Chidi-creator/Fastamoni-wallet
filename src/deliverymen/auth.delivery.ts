import express from "express";
import AuthHandler from "@handlers/auth.handler";

const router = express.Router();
const authHandler = new AuthHandler();

router.route("/login").post(authHandler.login);
router.route("/verify-otp").post(authHandler.verifyOtpAndIssueTokens);

export default router;
