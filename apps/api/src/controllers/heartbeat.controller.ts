import type { Request, Response } from "express";

export async function heartbeatPingController(_req: Request, res: Response): Promise<void> {
  res.json({ message: "Heartbeat endpoint ready" });
}
