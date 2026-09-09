import {
  getActiveSessions,
  getAdminMetrics,
  getPendingDisputes,
  getPendingWithdrawals,
  processWithdrawalBatch,
  resolveDispute
} from "../db/repositories/admin.repository.js";
import { emitRealtime, userRoom } from "../realtime.js";
import { resolveDisputeRecordForAdmin } from "./dispute.service.js";
import { finalizeSession } from "../db/repositories/session-lifecycle.repository.js";

export {
  getActiveSessions,
  getAdminMetrics,
  getPendingDisputes,
  getPendingWithdrawals,
  processWithdrawalBatch,
  resolveDispute
};

export async function resolveDisputeRealtime(disputeId: string, actorId: string, resolution: "provider" | "client" | "partial", notes?: string) {
  const result = await resolveDisputeRecordForAdmin({ disputeId, actorId, resolution, notes });
  if (result) {
    const finalized = await finalizeSession(result.sessionId, resolution === "provider" ? "completada" : "incumplida");
    if (finalized) {
      emitRealtime("dispute:resolved", ["admin", userRoom("provider", finalized.providerId), ...(finalized.clientId ? [userRoom("client", finalized.clientId)] : [])], { disputeId: result.disputeId, sessionId: result.sessionId, resolution });
    }
  }
  return result;
}
