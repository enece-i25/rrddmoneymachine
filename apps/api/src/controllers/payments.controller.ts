import type { Request, Response } from "express";

export async function createCheckoutController(_req: Request, res: Response): Promise<void> {
  res.status(501).json({ message: "Mercado Pago integration scaffolded" });
}

export async function convertUsdToArsController(req: Request, res: Response): Promise<void> {
  const amountUsd = Number(req.query.amountUsd ?? 0);
  const mepRate = 1250;
  res.json({ amountUsd, mepRate, amountArs: amountUsd * mepRate, source: "MEP" });
}
