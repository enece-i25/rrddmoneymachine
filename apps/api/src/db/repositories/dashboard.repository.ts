import { pool } from "../client.js";

export async function getProviderDashboard(providerId: string) {
  const [metrics, history] = await Promise.all([
    pool.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', now()))::int AS "sessionsThisMonth",
        COALESCE(AVG(compliance_pct) FILTER (WHERE created_at >= date_trunc('month', now())), 0)::float AS "averageCompliance",
        COALESCE(SUM(amount_earned) FILTER (WHERE created_at >= date_trunc('month', now())), 0)::float AS "investedThisMonth"
      FROM sessions
      WHERE provider_id = $1
      `,
      [providerId]
    ),
    pool.query(
      `
      SELECT
        session_id AS "sessionId",
        platform,
        scheduled_duration_min AS "scheduledDurationMin",
        collaborators_requested AS "collaboratorsRequested",
        live_url AS "liveUrl",
        start_time AS "startTime",
        end_time AS "endTime",
        status,
        compliance_pct AS "compliancePct",
        amount_earned AS "amountEarned",
        created_at AS "createdAt"
      FROM sessions
      WHERE provider_id = $1
      ORDER BY created_at DESC
      LIMIT 50
      `,
      [providerId]
    )
  ]);

  return {
    metrics: metrics.rows[0],
    history: history.rows
  };
}

export async function getProviderCredits(providerId: string) {
  const result = await pool.query(
    `
    SELECT
      credit_id AS "creditId",
      amount::float AS amount,
      status,
      created_at AS "createdAt",
      expires_at AS "expiresAt",
      withdrawal_eligible_from AS "withdrawalEligibleFrom"
    FROM provider_credit
    WHERE provider_id = $1
      AND status IN ('available', 'expiring_soon')
    ORDER BY expires_at ASC
    `,
    [providerId]
  );

  return result.rows;
}

export async function getProviderCreditTotal(providerId: string): Promise<number> {
  const result = await pool.query<{ total: number }>(
    `
    SELECT COALESCE(SUM(amount), 0)::float AS total
    FROM provider_credit
    WHERE provider_id = $1
      AND status IN ('available', 'expiring_soon')
    `,
    [providerId]
  );

  return result.rows[0]?.total ?? 0;
}

export async function consumeProviderCredits(providerId: string, requestedAmount: number): Promise<number> {
  const client = await pool.connect();
  let remaining = requestedAmount;
  let consumed = 0;
  try {
    await client.query("BEGIN");
    const credits = await client.query<{ creditId: string; amount: number }>(
      `SELECT credit_id AS "creditId", amount::float FROM provider_credit WHERE provider_id = $1 AND status IN ('available', 'expiring_soon') ORDER BY expires_at ASC FOR UPDATE`,
      [providerId]
    );
    for (const credit of credits.rows) {
      if (remaining <= 0) break;
      const amount = Math.min(remaining, credit.amount);
      const nextAmount = credit.amount - amount;
      await client.query(
        `UPDATE provider_credit SET amount = $2::numeric, status = CASE WHEN $2::numeric <= 0 THEN 'consumed' ELSE status END, consumed_at = CASE WHEN $2::numeric <= 0 THEN now() ELSE consumed_at END WHERE credit_id = $1`,
        [credit.creditId, nextAmount]
      );
      consumed += amount;
      remaining -= amount;
    }
    await client.query("COMMIT");
    return consumed;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
