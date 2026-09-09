import type { Request, Response } from "express";
import { z } from "zod";
import {
  getActiveSessions,
  getAdminMetrics,
  getPendingDisputes,
  getPendingWithdrawals,
  processWithdrawalBatch,
  resolveDisputeRealtime
} from "../services/admin.service.js";
import { getAdminSessionHistory } from "../db/repositories/session-lifecycle.repository.js";
import { writeAuditLog } from "../db/repositories/audit.repository.js";

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
    res.json(await resolveDisputeRealtime(req.params.id, req.user!.userId, body.resolution, body.notes));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Unable to resolve dispute" });
  }
}

export async function withdrawalsController(_req: Request, res: Response): Promise<void> {
  res.json(await getPendingWithdrawals());
}

export async function processWithdrawalsController(_req: Request, res: Response): Promise<void> {
  const processed = await processWithdrawalBatch();
  for (const item of processed) await writeAuditLog({ actorId: _req.user!.userId, action: "withdrawal_batch_processed", targetType: "withdrawal_request", targetId: item.withdrawalId, metadata: { amount: item.amount } });
  res.json({ processed });
}

export async function adminSessionHistoryController(req: Request, res: Response): Promise<void> {
  const statuses = String(req.query.status ?? "completada,incumplida,disputada").split(",");
  res.json(await getAdminSessionHistory(statuses));
}
