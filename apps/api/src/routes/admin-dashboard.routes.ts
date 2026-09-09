import { Router } from "express";
import {
  activeSessionsController,
  adminSessionHistoryController,
  adminMetricsController,
  disputesController,
  processWithdrawalsController,
  resolveDisputeController,
  withdrawalsController
} from "../controllers/admin-dashboard.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";
import { adminSubroleMiddleware } from "../middleware/admin-subrole.middleware.js";
import { auditLogController } from "../controllers/audit.controller.js";

const adminDashboardRouter = Router();
const adminOnly = [authMiddleware, roleMiddleware("admin")];

adminDashboardRouter.get("/dashboard/metrics", ...adminOnly, adminMetricsController);
adminDashboardRouter.get("/sessions/active", ...adminOnly, activeSessionsController);
adminDashboardRouter.get("/sessions", ...adminOnly, adminSessionHistoryController);
adminDashboardRouter.get("/disputes", ...adminOnly, disputesController);
adminDashboardRouter.post("/disputes/:id/resolve", ...adminOnly, resolveDisputeController);
adminDashboardRouter.get("/withdrawals", ...adminOnly, adminSubroleMiddleware("finance", "super_admin"), withdrawalsController);
adminDashboardRouter.post("/withdrawals/process-batch", ...adminOnly, adminSubroleMiddleware("finance", "super_admin"), processWithdrawalsController);
adminDashboardRouter.get("/audit-log", ...adminOnly, adminSubroleMiddleware("super_admin"), auditLogController);

export { adminDashboardRouter };
