import type { Request, Response } from "express";
import { z } from "zod";
import {
  applyToSession,
  createWithdrawal,
  getAvailableSessions,
  getCollaboratorBalance,
  getCollaboratorSummary,
  getUpcomingSession
} from "../services/collaborator.service.js";

export async function collaboratorSummaryController(req: Request, res: Response): Promise<void> {
  res.json(await getCollaboratorSummary(req.user!.userId));
}

export async function collaboratorBalanceController(req: Request, res: Response): Promise<void> {
  res.json(await getCollaboratorBalance(req.user!.userId));
}

export async function availableSessionsController(_req: Request, res: Response): Promise<void> {
  res.json(await getAvailableSessions());
}

export async function upcomingSessionController(req: Request, res: Response): Promise<void> {
  res.json(await getUpcomingSession(req.user!.userId));
}

export async function applySessionController(req: Request, res: Response): Promise<void> {
  const result = await applyToSession(req.params.id, req.user!.userId);
  if (!result) {
    res.status(409).json({ message: "Session is no longer available" });
    return;
  }
  res.json(result);
}

export async function createWithdrawalController(req: Request, res: Response): Promise<void> {
  try {
    const { amount } = z.object({ amount: z.number().positive() }).parse(req.body);
    res.status(201).json(await createWithdrawal(req.user!.userId, amount));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Unable to request withdrawal" });
  }
}
