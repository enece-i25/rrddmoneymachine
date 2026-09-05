import type { Request, Response } from "express";

export async function adminSummaryController(_req: Request, res: Response): Promise<void> {
  res.json({ disputesPending: 0, withdrawalsPending: 0 });
}
