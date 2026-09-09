import { pool } from "../client.js";

export type ProviderDashboardSummary = {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  disputedSessions: number;
  pendingCredits: number;
};

export async function getProviderDashboardSummary(
  providerId: string
): Promise<ProviderDashboardSummary> {
  const result = await pool.query<ProviderDashboardSummary>(
    `
    SELECT
      COUNT(*)::int AS "totalSessions",
      COUNT(*) FILTER (WHERE status = 'en_curso')::int AS "activeSessions",
      COUNT(*) FILTER (WHERE status = 'completada')::int AS "completedSessions",
      COUNT(*) FILTER (WHERE status = 'disputada')::int AS "disputedSessions",
      COALESCE(
        (
          SELECT SUM(amount)
          FROM provider_credit
          WHERE provider_id = $1
            AND status IN ('available', 'expiring_soon')
        ),
        0
      )::numeric AS "pendingCredits"
    FROM sessions
    WHERE provider_id = $1
    `,
    [providerId]
  );

  const row = result.rows[0];
  return {
    ...row,
    pendingCredits: Number(row.pendingCredits)
  };
}

export async function createSession(input: {
  providerId: string;
  platform: "tiktok" | "instagram";
  scheduledDurationMin: number;
  collaboratorsRequested: number;
  liveUrl?: string;
}): Promise<{ sessionId: string }> {
  const result = await pool.query<{ sessionId: string }>(
    `
    INSERT INTO sessions (provider_id, platform, scheduled_duration_min, collaborators_requested, live_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING session_id AS "sessionId"
    `,
    [input.providerId, input.platform, input.scheduledDurationMin, input.collaboratorsRequested, input.liveUrl ?? null]
  );

  return result.rows[0];
}

export async function findActiveByClientId(clientId: string) {
  const result = await pool.query<{ sessionId: string }>(
    `SELECT session_id AS "sessionId" FROM sessions WHERE client_id = $1 AND status IN ('programada', 'en_curso') LIMIT 1`,
    [clientId]
  );
  return result.rows[0] ?? null;
}
