import { pool } from "../client.js";

export async function startDueScheduledSessions() {
  const result = await pool.query(
    `
    UPDATE sessions
    SET status = 'en_curso',
        end_time = COALESCE(end_time, start_time + make_interval(mins => scheduled_duration_min))
    WHERE status = 'programada'
      AND client_id IS NOT NULL
      AND start_time IS NOT NULL
      AND start_time <= now()
    RETURNING
      session_id AS "sessionId",
      provider_id AS "providerId",
      client_id AS "clientId",
      start_time AS "startTime",
      end_time AS "endTime"
    `
  );
  return result.rows;
}
