import { Router } from "express";
import {
  createSessionController,
  providerSummaryController,
  sessionsListController
} from "../controllers/sessions.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";
import { applySessionController } from "../controllers/collaborator.controller.js";

const sessionsRouter = Router();

sessionsRouter.get("/provider/summary", authMiddleware, roleMiddleware("provider"), providerSummaryController);
sessionsRouter.post("/provider", authMiddleware, roleMiddleware("provider"), createSessionController);
sessionsRouter.post("/", authMiddleware, roleMiddleware("provider"), createSessionController);
sessionsRouter.get("/", authMiddleware, roleMiddleware("provider", "client"), sessionsListController);
sessionsRouter.post("/:id/apply", authMiddleware, roleMiddleware("client"), applySessionController);

export { sessionsRouter };
