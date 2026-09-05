import type { Request, Response } from "express";
import { z } from "zod";
import {
  getActiveSessions,
  getAdminMetrics,
  getPendingDisputes,
  getPendingWithdrawals,
  processWithdrawalBatch,
  resolveDispute
} from "../services/admin.service.js";

export async function adminMetricsController(_req: Request, res: Response): Promise<void> {
  res.json(await getAdminMetrics());
}

export async function activeSessionsController(_req: Request, res: Response): Promise<void> {
  res.json(await getActiveSessions());
}

export async function disputesController(_req: Request, res: Response): Promise<void> {
  res.json(await getPendingDisputes());
}

export async function resolveDisputeController(req: Request, res: Response): Promise<void> {
  try {
    const body = z.object({
      resolution: z.enum(["provider", "client", "partial"]),
      notes: z.string().optional()
    }).parse(req.body);
    res.json(await resolveDispute(req.params.id, body.resolution, body.notes));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Unable to resolve dispute" });
  }
}

export async function withdrawalsController(_req: Request, res: Response): Promise<void> {
  res.json(await getPendingWithdrawals());
}

export async function processWithdrawalsController(_req: Request, res: Response): Promise<void> {
  res.json({ processed: await processWithdrawalBatch() });
}
