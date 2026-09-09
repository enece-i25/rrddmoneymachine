import { pool } from "../../client.js";
import { hashPassword } from "../../../services/auth.service.js";

export const QA_PASSWORD = "Test1234!";

const fixtures = {
  provider: {
    email: "qa.provider@rrdd.test",
    phone: "+5493794000001",
    role: "provider",
    businessName: "QA Kiosco Test"
  },
  client: {
    email: "qa.collaborator@rrdd.test",
    phone: "+5493794000002",
    role: "client"
  },
  admin: {
    email: "qa.admin@rrdd.test",
    phone: "+5493794000003",
    role: "admin",
    adminSubrole: "super_admin"
  }
} as const;

export async function upsertQaUsers(): Promise<{ providerId: string; clientId: string; adminId: string }> {
  const passwordHash = await hashPassword(QA_PASSWORD);
  const ids: Record<"provider" | "client" | "admin", string> = {} as Record<"provider" | "client" | "admin", string>;

  for (const [key, fixture] of Object.entries(fixtures) as Array<[keyof typeof fixtures, (typeof fixtures)[keyof typeof fixtures]]>) {
    const result = await pool.query<{ userId: string }>(
      `
      INSERT INTO users (email, password_hash, phone, phone_verified, email_verified, role, admin_subrole, status)
      VALUES ($1, $2, $3, true, true, $4, $5, 'active')
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        phone_verified = true,
        email_verified = true,
        role = EXCLUDED.role,
        admin_subrole = EXCLUDED.admin_subrole,
        status = 'active'
      RETURNING user_id AS "userId"
      `,
      [fixture.email, passwordHash, fixture.phone, fixture.role, "adminSubrole" in fixture ? fixture.adminSubrole : null]
    );
    ids[key] = result.rows[0].userId;
  }

  await pool.query(
    `
    INSERT INTO provider_profiles (user_id, business_name, category, verified)
    VALUES ($1, $2, 'kiosco', true)
    ON CONFLICT (user_id) DO UPDATE SET business_name = EXCLUDED.business_name, category = 'kiosco', verified = true
    `,
    [ids.provider, fixtures.provider.businessName]
  );

  await pool.query(
    `
    INSERT INTO client_profiles (user_id, verification_tier, tier_pay_multiplier, trailing_compliance_avg, total_sessions_completed)
    VALUES ($1, 'trusted', 1.10, 90, 10)
    ON CONFLICT (user_id) DO UPDATE SET
      verification_tier = 'trusted', tier_pay_multiplier = 1.10,
      trailing_compliance_avg = 90, total_sessions_completed = 10,
      tier_warning_active = false, grace_sessions_remaining = 0
    `,
    [ids.client]
  );

  return { providerId: ids.provider, clientId: ids.client, adminId: ids.admin };
}
