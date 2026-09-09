import { pool } from "../../client.js";

export async function upsertQaSession(providerId: string, clientId: string): Promise<string> {
  const result = await pool.query<{ sessionId: string }>(
    `
    INSERT INTO sessions (
      provider_id, client_id, platform, scheduled_duration_min,
      collaborators_requested, status, start_time, end_time
    )
    SELECT $1, $2, 'tiktok', 30, 1, 'en_curso', now(), now() + interval '30 minutes'
    WHERE NOT EXISTS (
      SELECT 1 FROM sessions
      WHERE provider_id = $1 AND client_id = $2 AND status = 'en_curso'
    )
    RETURNING session_id AS "sessionId"
    `,
    [providerId, clientId]
  );

  if (result.rows[0]) return result.rows[0].sessionId;

  const existing = await pool.query<{ sessionId: string }>(
    `
    SELECT session_id AS "sessionId"
    FROM sessions
    WHERE provider_id = $1 AND client_id = $2 AND status = 'en_curso'
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [providerId, clientId]
  );

  if (!existing.rows[0]) throw new Error("Unable to create or find QA session");
  return existing.rows[0].sessionId;
}
