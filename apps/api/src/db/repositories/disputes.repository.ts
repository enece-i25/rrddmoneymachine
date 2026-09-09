import { pool } from "../client.js";

export async function createDispute(input: { sessionId: string; reportedBy: string; reason: string }) {
  const result = await pool.query(
    `
    INSERT INTO disputes (session_id, reported_by, reason, evidence_snapshot)
    SELECT $1, $2, $3, jsonb_build_object(
      'compliancePct', s.compliance_pct,
      'status', s.status
    )
    FROM sessions s
    WHERE s.session_id = $1 AND s.provider_id = $2
    RETURNING dispute_id AS "disputeId", session_id AS "sessionId", status, created_at AS "createdAt"
    `,
    [input.sessionId, input.reportedBy, input.reason]
  );
  if (!result.rows[0]) throw new Error("Session not found or provider is not authorized");
  await pool.query("UPDATE sessions SET status = 'disputada' WHERE session_id = $1", [input.sessionId]);
  return result.rows[0];
}

export async function getPendingDisputesFromTable() {
  const result = await pool.query(`
    SELECT d.dispute_id AS "disputeId", d.session_id AS "sessionId", d.reason,
      d.evidence_snapshot AS "evidenceSnapshot", d.status, d.created_at AS "createdAt",
      s.provider_id AS "providerId", s.client_id AS "clientId", s.compliance_pct AS "compliancePct"
    FROM disputes d JOIN sessions s ON s.session_id = d.session_id
    WHERE d.status = 'pending' ORDER BY d.created_at ASC
  `);
  return result.rows;
}

export async function resolveDisputeRecord(input: { disputeId: string; actorId: string; resolution: "provider" | "client" | "partial"; notes?: string }) {
  const status = input.resolution === "provider" ? "resolved_provider" : input.resolution === "client" ? "resolved_client" : "resolved_partial";
  const result = await pool.query(`
    UPDATE disputes SET status = $2, resolution_notes = $3, resolved_by = $4, resolved_at = now()
    WHERE dispute_id = $1 AND status = 'pending'
    RETURNING dispute_id AS "disputeId", session_id AS "sessionId", status
  `, [input.disputeId, status, input.notes ?? null, input.actorId]);
  return result.rows[0] ?? null;
}
