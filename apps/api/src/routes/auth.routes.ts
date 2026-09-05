import { Router } from "express";
import {
  loginController,
  logoutController,
  refreshController,
  registerController,
  verifyEmailController,
  verifyPhoneController
} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/verify-email", verifyEmailController);
authRouter.post("/verify-phone", verifyPhoneController);
authRouter.post("/login", loginController);
authRouter.post("/refresh", refreshController);
authRouter.post("/logout", logoutController);

export { authRouter };
