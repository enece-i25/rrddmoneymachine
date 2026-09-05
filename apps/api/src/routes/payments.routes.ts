import { Router } from "express";
import {
  convertUsdToArsController,
  createCheckoutController
} from "../controllers/payments.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const paymentsRouter = Router();

paymentsRouter.post("/checkout", authMiddleware, roleMiddleware("provider"), createCheckoutController);
paymentsRouter.get("/convert", authMiddleware, roleMiddleware("provider", "admin"), convertUsdToArsController);

export { paymentsRouter };
