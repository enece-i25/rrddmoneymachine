import { Router } from "express";
import {
  createSessionController,
  providerSummaryController
} from "../controllers/sessions.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const sessionsRouter = Router();

sessionsRouter.get("/provider/summary", authMiddleware, roleMiddleware("provider"), providerSummaryController);
sessionsRouter.post("/provider", authMiddleware, roleMiddleware("provider"), createSessionController);

export { sessionsRouter };
