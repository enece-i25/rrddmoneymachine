import { Router } from "express";
import { heartbeatConfirmController, heartbeatPingController } from "../controllers/heartbeat.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const heartbeatRouter = Router();

heartbeatRouter.post("/ping", authMiddleware, heartbeatPingController);
heartbeatRouter.post("/sessions/:sessionId/heartbeat", authMiddleware, roleMiddleware("client"), heartbeatConfirmController);

export { heartbeatRouter };
