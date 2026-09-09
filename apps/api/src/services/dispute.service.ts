export function disputeWindowEndsAt(sessionEndedAt: Date): Date {
  const deadline = new Date(sessionEndedAt);
  deadline.setHours(deadline.getHours() + 48);
  return deadline;
}

export function canReleasePendingBalance(now: Date, sessionEndedAt: Date): boolean {
  return now >= disputeWindowEndsAt(sessionEndedAt);
}

import { createDispute, resolveDisputeRecord } from "../db/repositories/disputes.repository.js";
import { writeAuditLog } from "../db/repositories/audit.repository.js";

export async function reportDispute(sessionId: string, providerId: string, reason: string) {
  return createDispute({ sessionId, reportedBy: providerId, reason });
}

export async function resolveDisputeRecordForAdmin(input: { disputeId: string; actorId: string; resolution: "provider" | "client" | "partial"; notes?: string }) {
  const result = await resolveDisputeRecord(input);
  if (result) await writeAuditLog({ actorId: input.actorId, action: "dispute_resolved", targetType: "dispute", targetId: result.disputeId, metadata: { resolution: input.resolution, notes: input.notes ?? null } });
  return result;
}
