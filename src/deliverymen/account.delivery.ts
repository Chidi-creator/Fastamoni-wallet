import express from "express";
import { AuthService } from "@services/auth.service";
import AcccountHandler from "@handlers/account.handler";

const router = express.Router();
const authService = new AuthService();
const accountHandler = new AcccountHandler();

router.route("/resolve").post([authService.auth], accountHandler.createAccount);
router.route("/user").get([authService.auth], accountHandler.findUserAccountsById);

export default router;