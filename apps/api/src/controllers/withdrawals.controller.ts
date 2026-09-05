import type { Request, Response } from "express";
import { z } from "zod";
import { createWithdrawal } from "../services/collaborator.service.js";

export async function listWithdrawalRequestsController(_req: Request, res: Response): Promise<void> {
  res.json({ items: [] });
}

export async function createWithdrawalRequestController(req: Request, res: Response): Promise<void> {
  try {
    const { amount } = z.object({ amount: z.number().positive() }).parse(req.body);
    res.status(201).json(await createWithdrawal(req.user!.userId, amount));
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Unable to request withdrawal" });
  }
}
