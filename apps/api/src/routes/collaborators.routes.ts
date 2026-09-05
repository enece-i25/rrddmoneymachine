import { Router } from "express";
import {
  applySessionController,
  availableSessionsController,
  collaboratorBalanceController,
  collaboratorSummaryController,
  createWithdrawalController,
  upcomingSessionController
} from "../controllers/collaborator.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const collaboratorsRouter = Router();
const clientOnly = [authMiddleware, roleMiddleware("client")];

collaboratorsRouter.get("/me/summary", ...clientOnly, collaboratorSummaryController);
collaboratorsRouter.get("/me/balance", ...clientOnly, collaboratorBalanceController);
collaboratorsRouter.get("/me/upcoming", ...clientOnly, upcomingSessionController);
collaboratorsRouter.get("/sessions", ...clientOnly, availableSessionsController);
collaboratorsRouter.post("/sessions/:id/apply", ...clientOnly, applySessionController);
collaboratorsRouter.post("/withdrawals", ...clientOnly, createWithdrawalController);

export { collaboratorsRouter };
