import { Router } from "express";
import { registerDeviceTokenController } from "../controllers/notifications.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const notificationsRouter = Router();
notificationsRouter.post("/register-token", authMiddleware, roleMiddleware("client"), registerDeviceTokenController);
export { notificationsRouter };
