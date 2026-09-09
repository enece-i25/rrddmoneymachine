import { pool } from "../client.js";
import { finalizeSession } from "./session-lifecycle.repository.js";
import { getPendingDisputesFromTable } from "./disputes.repository.js";

export async function getAdminMetrics() {
  const result = await pool.query(
    `
    SELECT
      COALESCE(SUM(amount_ars) FILTER (WHERE created_at >= current_date AND status = 'approved'), 0)::float AS "revenueToday",
      COALESCE(SUM(amount_ars) FILTER (WHERE created_at >= current_date AND status = 'approved'), 0)::float AS "netMarginToday",
      (SELECT COUNT(*)::int FROM sessions WHERE status = 'en_curso') AS "activeSessions",
      (SELECT COUNT(*)::int FROM withdrawal_requests WHERE status = 'requested') AS "pendingWithdrawals"
    FROM payments_in
    `
  );
  return result.rows[0];
}

export async function getActiveSessions() {
  const result = await pool.query(
    `
    SELECT
      s.session_id AS "sessionId",
      s.provider_id AS "providerId",
      s.client_id AS "clientId",
      s.platform,
      s.status,
      s.compliance_pct AS "compliancePct",
      COUNT(h.heartbeat_id) FILTER (WHERE h.passed = false)::int AS "failedHeartbeats",
      MAX(h.ts) AS "lastHeartbeat"
    FROM sessions s
    LEFT JOIN heartbeats h ON h.session_id = s.session_id
    WHERE s.status = 'en_curso'
    GROUP BY s.session_id
    ORDER BY s.start_time ASC
    `
  );
  return result.rows;
}

export async function getPendingDisputes() {
  return getPendingDisputesFromTable();
}

export async function resolveDispute(sessionId: string, resolution: "provider" | "client" | "partial", notes?: string) {
  const status = resolution === "provider" ? "completada" : "incumplida";
  const result = await finalizeSession(sessionId, status);
  return {
    sessionId: result?.sessionId ?? sessionId,
    providerId: result?.providerId ?? null,
    clientId: result?.clientId ?? null,
    status: result?.status ?? "disputada",
    resolution,
    notes: notes ?? null
  };
}

export async function getPendingWithdrawals() {
  const result = await pool.query(
    `
    SELECT
      withdrawal_id AS "withdrawalId",
      client_id AS "clientId",
      amount::float,
      status,
      requested_at AS "requestedAt"
    FROM withdrawal_requests
    WHERE status = 'requested'
    ORDER BY requested_at ASC
    `
  );
  return result.rows;
}

export async function processWithdrawalBatch() {
  const result = await pool.query(
    `
    UPDATE withdrawal_requests
    SET status = 'processing'
    WHERE status = 'requested'
    RETURNING withdrawal_id AS "withdrawalId", amount::float
    `
  );
  return result.rows;
}
