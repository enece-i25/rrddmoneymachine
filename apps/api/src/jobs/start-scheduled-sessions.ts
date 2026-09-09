import { startDueScheduledSessions } from "../db/repositories/scheduled-sessions.repository.js";
import { emitRealtime, userRoom } from "../realtime.js";
import { startHeartbeatForSession } from "../services/heartbeat.service.js";

export async function startScheduledSessionsJob(): Promise<void> {
  const sessions = await startDueScheduledSessions();
  for (const session of sessions) {
    startHeartbeatForSession(session.sessionId, session.clientId, session.providerId);
    emitRealtime(
      "session:status_changed",
      ["admin", userRoom("provider", session.providerId), userRoom("client", session.clientId)],
      { sessionId: session.sessionId, status: "en_curso", startTime: session.startTime, endTime: session.endTime }
    );
    console.log(`Scheduled session started: ${session.sessionId}`);
  }
}
