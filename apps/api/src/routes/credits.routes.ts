import { Router } from "express";
import { providerCreditsController } from "../controllers/credits.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { roleMiddleware } from "../middleware/role.middleware.js";

const creditsRouter = Router();

creditsRouter.get("/provider", authMiddleware, roleMiddleware("provider"), providerCreditsController);

export { creditsRouter };
