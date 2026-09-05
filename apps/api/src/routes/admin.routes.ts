import { Router } from "express";
import { adminSummaryController } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const adminRouter = Router();

adminRouter.get("/summary", authMiddleware, roleMiddleware("admin"), adminSummaryController);

export { adminRouter };
