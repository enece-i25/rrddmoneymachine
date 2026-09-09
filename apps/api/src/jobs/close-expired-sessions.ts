import { closeExpiredSessions, finalizeSession } from "../db/repositories/session-lifecycle.repository.js";
import { emitRealtime, userRoom } from "../realtime.js";

export async function closeExpiredSessionsJob(): Promise<void> {
  const sessions = await closeExpiredSessions();
  for (const session of sessions) {
    const result = await finalizeSession(session.sessionId, "incumplida");
    if (result) emitRealtime("session:status_changed", ["admin", userRoom("provider", result.providerId), ...(result.clientId ? [userRoom("client", result.clientId)] : [])], { sessionId: session.sessionId, status: "incumplida" });
  }
}
