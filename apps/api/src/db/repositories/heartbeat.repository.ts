import { pool } from "../client.js";

export async function getActiveSessionsForHeartbeat() {
  const result = await pool.query(
    `
    SELECT session_id AS "sessionId", provider_id AS "providerId", client_id AS "clientId",
      start_time AS "startTime", end_time AS "endTime"
    FROM sessions
    WHERE status = 'en_curso' AND client_id IS NOT NULL
    `
  );
  return result.rows;
}

export async function recordHeartbeat(input: {
  sessionId: string;
  passed: boolean;
  responseTimeMs: number;
  verificationType: "tap" | "captcha" | "keyword";
}) {
  const result = await pool.query(
    `
    INSERT INTO heartbeats (session_id, response_time_ms, verification_type, passed)
    VALUES ($1, $2, $3, $4)
    RETURNING heartbeat_id AS "heartbeatId", session_id AS "sessionId", ts, passed
    `,
    [input.sessionId, input.responseTimeMs, input.verificationType, input.passed]
  );
  return result.rows[0];
}

export async function getSessionParticipants(sessionId: string) {
  const result = await pool.query(
    `SELECT provider_id AS "providerId", client_id AS "clientId" FROM sessions WHERE session_id = $1`,
    [sessionId]
  );
  return result.rows[0] ?? null;
}

export async function countConsecutiveFailedHeartbeats(sessionId: string): Promise<number> {
  const result = await pool.query<{ failed: boolean }>(
    `SELECT passed = false AS failed FROM heartbeats WHERE session_id = $1 ORDER BY ts DESC LIMIT 3`,
    [sessionId]
  );
  let count = 0;
  for (const row of result.rows) {
    if (!row.failed) break;
    count += 1;
  }
  return count;
}

export async function markSessionUnmet(sessionId: string): Promise<void> {
  await pool.query(`UPDATE sessions SET status = 'incumplida' WHERE session_id = $1 AND status = 'en_curso'`, [sessionId]);
}
