import type { Request, Response } from "express";
import { getAuditLog } from "../db/repositories/audit.repository.js";

export async function auditLogController(_req: Request, res: Response): Promise<void> {
  res.json(await getAuditLog());
}
