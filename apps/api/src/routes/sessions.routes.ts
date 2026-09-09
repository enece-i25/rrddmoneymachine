import { Router } from "express";
import {
  createSessionController,
  providerSummaryController,
  sessionsListController
} from "../controllers/sessions.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";
import { applySessionController } from "../controllers/collaborator.controller.js";
import { heartbeatConfirmController } from "../controllers/heartbeat.controller.js";
import { reportDisputeController } from "../controllers/dispute.controller.js";

const sessionsRouter = Router();

sessionsRouter.get("/provider/summary", authMiddleware, roleMiddleware("provider"), providerSummaryController);
sessionsRouter.post("/provider", authMiddleware, roleMiddleware("provider"), createSessionController);
sessionsRouter.post("/", authMiddleware, roleMiddleware("provider"), createSessionController);
sessionsRouter.get("/", authMiddleware, roleMiddleware("provider", "client"), sessionsListController);
sessionsRouter.post("/:id/apply", authMiddleware, roleMiddleware("client"), applySessionController);
sessionsRouter.post("/:id/heartbeat", authMiddleware, roleMiddleware("client"), (req, res) => {
  req.params.sessionId = req.params.id;
  return heartbeatConfirmController(req, res);
});
sessionsRouter.post("/:id/dispute", authMiddleware, roleMiddleware("provider"), reportDisputeController);

export { sessionsRouter };
