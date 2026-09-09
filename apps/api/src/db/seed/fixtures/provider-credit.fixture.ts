import { pool } from "../../client.js";

export async function upsertQaProviderCredit(providerId: string): Promise<void> {
  await pool.query(
    `
    INSERT INTO provider_credit (
      provider_id, session_id, amount, status, expires_at, withdrawal_eligible_from
    )
    SELECT $1, NULL, 15.00, 'available', now() + interval '90 days', now() + interval '80 days'
    WHERE NOT EXISTS (
      SELECT 1 FROM provider_credit
      WHERE provider_id = $1 AND amount = 15.00 AND status = 'available' AND session_id IS NULL
    )
    `,
    [providerId]
  );
}
