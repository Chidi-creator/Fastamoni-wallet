import UserHandler from "@handlers/user.handler";
import express from "express";

const router = express.Router();
const userHandler = new UserHandler();

router.route("/register").post(userHandler.handleCreateUser);

export default router;
