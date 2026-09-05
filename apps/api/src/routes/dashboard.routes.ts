import { Router } from "express";
import { providerCreditsController, providerDashboardController } from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const dashboardRouter = Router();

dashboardRouter.get("/provider/dashboard", authMiddleware, roleMiddleware("provider"), providerDashboardController);
dashboardRouter.get("/credits/me", authMiddleware, roleMiddleware("provider"), providerCreditsController);

export { dashboardRouter };
