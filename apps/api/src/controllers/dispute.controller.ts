import type { Request, Response } from "express";
import { z } from "zod";
import { reportDispute } from "../services/dispute.service.js";
import { emitRealtime, userRoom } from "../realtime.js";
import { getSessionParticipants } from "../db/repositories/heartbeat.repository.js";

export async function reportDisputeController(req: Request, res: Response): Promise<void> {
  try {
    const { reason } = z.object({ reason: z.string().min(3) }).parse(req.body);
    const dispute = await reportDispute(req.params.id, req.user!.userId, reason);
    const participants = await getSessionParticipants(req.params.id);
    emitRealtime("dispute:created", ["admin", ...(participants?.providerId ? [userRoom("provider", participants.providerId)] : [])], { disputeId: dispute.disputeId, sessionId: dispute.sessionId });
    res.status(201).json(dispute);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Unable to report dispute" });
  }
}
