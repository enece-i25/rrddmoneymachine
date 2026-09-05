import type { Request, Response } from "express";

export async function listWithdrawalRequestsController(_req: Request, res: Response): Promise<void> {
  res.json({ items: [] });
}
