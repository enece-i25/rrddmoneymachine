import { pool } from "../client.js";

export async function writeAuditLog(input: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  await pool.query(
    `INSERT INTO audit_log (actor_id, action, target_type, target_id, metadata) VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [input.actorId, input.action, input.targetType, input.targetId, JSON.stringify(input.metadata ?? {})]
  );
}

export async function getAuditLog() {
  const result = await pool.query(`SELECT audit_id AS "auditId", actor_id AS "actorId", action, target_type AS "targetType", target_id AS "targetId", metadata, created_at AS "createdAt" FROM audit_log ORDER BY created_at DESC LIMIT 200`);
  return result.rows;
}
