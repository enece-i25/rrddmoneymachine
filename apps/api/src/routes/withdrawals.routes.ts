import { Router } from "express";
import { listWithdrawalRequestsController } from "../controllers/withdrawals.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const withdrawalsRouter = Router();

withdrawalsRouter.get("/", authMiddleware, roleMiddleware("client", "admin"), listWithdrawalRequestsController);

export { withdrawalsRouter };
