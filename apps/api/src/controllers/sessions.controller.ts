import type { Request, Response } from "express";
import { z } from "zod";
import {
  createSession,
  getProviderDashboardSummary
} from "../db/repositories/sessions.repository.js";

const createSessionSchema = z.object({
  platform: z.enum(["tiktok", "instagram"]),
  scheduledDurationMin: z.number().int().positive(),
  collaboratorsRequested: z.number().int().positive(),
  liveUrl: z.string().url().optional()
});

export async function providerSummaryController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Auth required" });
    return;
  }

  const summary = await getProviderDashboardSummary(req.user.userId);
  res.json(summary);
}

export async function createSessionController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Auth required" });
    return;
  }

  try {
    const input = createSessionSchema.parse(req.body);
    const session = await createSession({
      providerId: req.user.userId,
      ...input
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : "Invalid session request"
    });
  }
}
