import type { Request, Response } from "express";

export async function providerCreditsController(_req: Request, res: Response): Promise<void> {
  res.json({ balance: 0, credits: [] });
}
