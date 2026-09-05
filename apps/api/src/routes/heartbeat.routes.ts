import { Router } from "express";
import { heartbeatPingController } from "../controllers/heartbeat.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const heartbeatRouter = Router();

heartbeatRouter.post("/ping", authMiddleware, heartbeatPingController);

export { heartbeatRouter };
