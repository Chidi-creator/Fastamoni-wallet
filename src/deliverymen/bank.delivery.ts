import express from "express";
import BankHandler from "@handlers/bank.handler";
import { AuthService } from "@services/auth.service";

const router = express.Router();
const authService = new AuthService();
const bankHandler = new BankHandler();

router.route("/").get([authService.auth], bankHandler.getAllBanks);

export default router;
