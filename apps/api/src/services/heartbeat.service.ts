import {
  countConsecutiveFailedHeartbeats,
  getActiveSessionsForHeartbeat,
  getSessionParticipants,
  recordHeartbeat
} from "../db/repositories/heartbeat.repository.js";
import { finalizeSession } from "../db/repositories/session-lifecycle.repository.js";
import { emitRealtime, userRoom } from "../realtime.js";

export interface PushNotifier { send(userId: string, title: string, body: string): Promise<void>; }
export class NoopPushNotifier implements PushNotifier { async send(_userId: string, _title: string, _body: string): Promise<void> {} }

const intervalMs = () => Number(process.env.HEARTBEAT_INTERVAL_MS ?? 300000);
const windowMs = () => Number(process.env.HEARTBEAT_WINDOW_MS ?? 90000);
const timers = new Map<string, { prompt: ReturnType<typeof setTimeout>; close?: ReturnType<typeof setTimeout> }>();

async function closeWindow(sessionId: string, clientId: string, providerId: string): Promise<void> {
  console.log(`Heartbeat window expired for session ${sessionId}`);
  const result = await recordHeartbeat({ sessionId, passed: false, responseTimeMs: windowMs(), verificationType: "tap" });
  const consecutiveFailures = await countConsecutiveFailedHeartbeats(sessionId);
  if (consecutiveFailures >= 3) await finalizeSession(sessionId, "incumplida");
  if (consecutiveFailures >= 3) emitRealtime("session:status_changed", ["admin", userRoom("client", clientId), userRoom("provider", providerId)], { sessionId, status: "incumplida" });
  emitRealtime("heartbeat:result", ["admin", userRoom("client", clientId), userRoom("provider", providerId)], {
    sessionId, heartbeatId: result.heartbeatId, passed: false, consecutiveFailures,
    status: consecutiveFailures >= 3 ? "incumplida" : "en_curso"
  });
  if (consecutiveFailures < 3) scheduleNext(sessionId, clientId, providerId);
}

function scheduleNext(sessionId: string, clientId: string, providerId: string): void {
  const prompt = setTimeout(() => {
    const windowExpiresAt = new Date(Date.now() + windowMs()).toISOString();
    console.log(`Heartbeat prompt for session ${sessionId}; expires ${windowExpiresAt}`);
    emitRealtime("heartbeat:prompt", [userRoom("client", clientId)], { sessionId, windowExpiresAt, verificationType: "tap" });
    const current = timers.get(sessionId);
    if (current) current.close = setTimeout(() => void closeWindow(sessionId, clientId, providerId), windowMs());
  }, intervalMs());
  timers.set(sessionId, { prompt });
}

export function startHeartbeatForSession(sessionId: string, clientId: string, providerId: string): void {
  if (timers.has(sessionId)) return;
  scheduleNext(sessionId, clientId, providerId);
  console.log(`Heartbeat monitoring started for session ${sessionId}`);
}

export function startHeartbeatMonitoring(): void {
  const scan = async () => {
    const sessions = await getActiveSessionsForHeartbeat();
    for (const session of sessions) {
      if (!timers.has(session.sessionId)) {
        startHeartbeatForSession(session.sessionId, session.clientId, session.providerId);
      }
    }
  };
  void scan();
  setInterval(() => void scan(), Math.min(intervalMs(), 30000));
}

export async function confirmHeartbeat(input: {
  sessionId: string; clientId: string; passed: boolean;
  verificationType: "tap" | "captcha" | "keyword"; startedAt: number;
}) {
  const participants = await getSessionParticipants(input.sessionId);
  if (!participants || participants.clientId !== input.clientId) throw new Error("Session is not assigned to this collaborator");
  const timer = timers.get(input.sessionId);
  if (timer?.close) clearTimeout(timer.close);
  const result = await recordHeartbeat({ sessionId: input.sessionId, passed: input.passed, responseTimeMs: Math.max(0, Date.now() - input.startedAt), verificationType: input.verificationType });
  const consecutiveFailures = input.passed ? 0 : await countConsecutiveFailedHeartbeats(input.sessionId);
  if (consecutiveFailures >= 3) await finalizeSession(input.sessionId, "incumplida");
  if (consecutiveFailures >= 3) emitRealtime("session:status_changed", ["admin", userRoom("client", input.clientId), userRoom("provider", participants.providerId)], { sessionId: input.sessionId, status: "incumplida" });
  emitRealtime("heartbeat:result", ["admin", userRoom("client", input.clientId), userRoom("provider", participants.providerId)], { sessionId: input.sessionId, heartbeatId: result.heartbeatId, passed: input.passed, consecutiveFailures, status: consecutiveFailures >= 3 ? "incumplida" : "en_curso" });
  if (consecutiveFailures < 3) scheduleNext(input.sessionId, input.clientId, participants.providerId);
  return result;
}
