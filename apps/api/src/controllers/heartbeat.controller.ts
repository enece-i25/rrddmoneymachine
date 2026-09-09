import type { Request, Response } from "express";
import { z } from "zod";
import { confirmHeartbeat } from "../services/heartbeat.service.js";

export async function heartbeatPingController(_req: Request, res: Response): Promise<void> {
  res.json({ message: "Heartbeat endpoint ready" });
}

export async function heartbeatConfirmController(req: Request, res: Response): Promise<void> {
  try {
    const input = z.object({
      passed: z.boolean(),
      verificationType: z.enum(["tap", "captcha", "keyword"]),
      startedAt: z.number().positive()
    }).parse(req.body);
    res.json(await confirmHeartbeat({ ...input, sessionId: req.params.sessionId, clientId: req.user!.userId }));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Heartbeat confirmation failed" });
  }
}
