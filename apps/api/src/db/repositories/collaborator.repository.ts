import { pool } from "../client.js";

export async function getCollaboratorSummary(clientId: string) {
  const result = await pool.query(
    `
    SELECT
      verification_tier AS tier,
      tier_pay_multiplier::float AS multiplier,
      COALESCE(trailing_compliance_avg, 0)::float AS "averageCompliance",
      reputation_score::float AS reputation,
      total_sessions_completed AS "completedSessions",
      tier_warning_active AS "tierWarningActive",
      grace_sessions_remaining AS "graceSessionsRemaining"
    FROM client_profiles
    WHERE user_id = $1
    `,
    [clientId]
  );

  return result.rows[0] ?? {
    tier: "new",
    multiplier: 1,
    averageCompliance: 0,
    reputation: 0,
    completedSessions: 0,
    tierWarningActive: false,
    graceSessionsRemaining: 0
  };
}

export async function getCollaboratorBalance(clientId: string) {
  const result = await pool.query(
    `
    SELECT
      COALESCE(SUM(amount) FILTER (WHERE status = 'pending_review'), 0)::float AS "pendingReview",
      COALESCE(SUM(amount) FILTER (WHERE status = 'available'), 0)::float AS available,
      COALESCE(SUM(amount) FILTER (WHERE status = 'withdrawn'), 0)::float AS withdrawn
    FROM client_balance
    WHERE client_id = $1
    `,
    [clientId]
  );

  return {
    ...(result.rows[0] ?? { pendingReview: 0, available: 0, withdrawn: 0 }),
    withdrawalThreshold: 10
  };
}

export async function getAvailableSessions() {
  const result = await pool.query(
    `
    SELECT
      s.session_id AS "sessionId",
      s.platform,
      s.scheduled_duration_min AS "scheduledDurationMin",
      s.collaborators_requested AS "collaboratorsRequested",
      s.start_time AS "startTime",
      s.status,
      COUNT(applied.user_id)::int AS "appliedCount"
    FROM sessions s
    LEFT JOIN client_profiles applied ON applied.user_id = s.client_id
    WHERE s.status = 'programada'
    GROUP BY s.session_id
    ORDER BY s.start_time NULLS LAST, s.created_at DESC
    `
  );

  return result.rows.map((row) => ({
    ...row,
    hasCapacity: Number(row.appliedCount) < Number(row.collaboratorsRequested)
  }));
}

export async function getUpcomingSession(clientId: string) {
  const result = await pool.query(
    `
    SELECT
      session_id AS "sessionId",
      platform,
      scheduled_duration_min AS "scheduledDurationMin",
      start_time AS "startTime",
      end_time AS "endTime",
      status,
      live_url AS "liveUrl"
    FROM sessions
    WHERE client_id = $1
      AND status = 'programada'
      AND (start_time IS NULL OR start_time >= now())
    ORDER BY start_time NULLS LAST
    LIMIT 1
    `,
    [clientId]
  );

  return result.rows[0] ?? null;
}

export async function applyToSession(sessionId: string, clientId: string) {
  const result = await pool.query(
    `
    UPDATE sessions
    SET client_id = $2
    WHERE session_id = $1
      AND status = 'programada'
      AND client_id IS NULL
    RETURNING session_id AS "sessionId", provider_id AS "providerId"
    `,
    [sessionId, clientId]
  );

  return result.rows[0] ?? null;
}

export async function createWithdrawal(clientId: string, amount: number) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const balance = await client.query<{ available: number }>(
      `SELECT COALESCE(SUM(amount), 0)::float AS available FROM client_balance WHERE client_id = $1 AND status = 'available'`,
      [clientId]
    );
    const available = balance.rows[0]?.available ?? 0;
    if (available < amount || amount < 10) {
      throw new Error("Insufficient available balance or amount below threshold");
    }

    const withdrawal = await client.query(
      `
      INSERT INTO withdrawal_requests (client_id, amount)
      VALUES ($1, $2)
      RETURNING withdrawal_id AS "withdrawalId", amount::float, status, requested_at AS "requestedAt"
      `,
      [clientId, amount]
    );
    await client.query("COMMIT");
    return withdrawal.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
