import { pool } from "../client.js";

export async function finalizeSession(sessionId: string, status: "completada" | "incumplida"): Promise<{
  sessionId: string;
  providerId: string;
  clientId: string | null;
  compliancePct: number | null;
  status: "completada" | "incumplida";
} | null> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const session = await client.query<{ sessionId: string; providerId: string; clientId: string | null; compliancePct: number | null }>(
      `
      UPDATE sessions
      SET status = $2
      WHERE session_id = $1 AND status IN ('en_curso', 'programada', 'disputada')
      RETURNING session_id AS "sessionId", provider_id AS "providerId", client_id AS "clientId", compliance_pct AS "compliancePct"
      `,
      [sessionId, status]
    );
    const row = session.rows[0];
    if (!row?.clientId) {
      await client.query("COMMIT");
      return row ? { ...row, status } : null;
    }

    await client.query(
      `
      WITH recent AS (
        SELECT compliance_pct
        FROM sessions
        WHERE client_id = $1 AND status IN ('completada', 'incumplida') AND compliance_pct IS NOT NULL
        ORDER BY end_time DESC NULLS LAST, created_at DESC
        LIMIT 15
      )
      UPDATE client_profiles
      SET total_sessions_completed = total_sessions_completed + CASE WHEN $2 = 'completada' THEN 1 ELSE 0 END,
          total_sessions_failed = total_sessions_failed + CASE WHEN $2 = 'incumplida' THEN 1 ELSE 0 END,
          trailing_compliance_avg = (SELECT COALESCE(AVG(compliance_pct), 0) FROM recent),
          reputation_score = (SELECT COALESCE(AVG(compliance_pct), 0) FROM recent)
      WHERE user_id = $1
      `,
      [row.clientId, status]
    );
    await client.query("COMMIT");
    return { ...row, status };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function closeExpiredSessions() {
  const result = await pool.query<{ sessionId: string }>(
    `SELECT session_id AS "sessionId" FROM sessions WHERE status IN ('programada', 'en_curso') AND end_time IS NOT NULL AND end_time <= now()`
  );
  return result.rows;
}

export async function getAdminSessionHistory(statuses: string[]) {
  const result = await pool.query(
    `
    SELECT session_id AS "sessionId", provider_id AS "providerId", client_id AS "clientId",
      platform, status, compliance_pct AS "compliancePct", end_time AS "endTime", created_at AS "createdAt"
    FROM sessions
    WHERE status = ANY($1::varchar[])
    ORDER BY end_time DESC NULLS LAST, created_at DESC
    LIMIT 100
    `,
    [statuses]
  );
  return result.rows;
}
