import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { adminRouter } from "./routes/admin.routes.js";
import { adminDashboardRouter } from "./routes/admin-dashboard.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { collaboratorsRouter } from "./routes/collaborators.routes.js";
import { creditsRouter } from "./routes/credits.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { heartbeatRouter } from "./routes/heartbeat.routes.js";
import { paymentsRouter } from "./routes/payments.routes.js";
import { sessionsRouter } from "./routes/sessions.routes.js";
import { webhooksRouter } from "./routes/webhooks.routes.js";
import { notificationsRouter } from "./routes/notifications.routes.js";
import { withdrawalsRouter } from "./routes/withdrawals.routes.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "api" });
});

app.use("/auth", authRouter);
app.use("/", dashboardRouter);
app.use("/collaborators", collaboratorsRouter);
app.use("/admin", adminDashboardRouter);
app.use("/sessions", sessionsRouter);
app.use("/heartbeat", heartbeatRouter);
app.use("/payments", paymentsRouter);
app.use("/withdrawals", withdrawalsRouter);
app.use("/credits", creditsRouter);
app.use("/admin", adminRouter);
app.use("/webhooks", webhooksRouter);
app.use("/notifications", notificationsRouter);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof Error) {
    res.status(500).json({ message: err.message });
    return;
  }

  res.status(500).json({ message: "Unexpected server error" });
});

export { app };
