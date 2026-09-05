import type { Request, Response } from "express";
import { providerCredits, providerDashboard } from "../services/dashboard.service.js";

export async function providerDashboardController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Auth required" });
    return;
  }
  res.json(await providerDashboard(req.user.userId));
}

export async function providerCreditsController(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Auth required" });
    return;
  }
  res.json(await providerCredits(req.user.userId));
}
