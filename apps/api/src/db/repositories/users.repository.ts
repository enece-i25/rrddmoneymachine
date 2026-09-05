import { randomInt } from "node:crypto";
import { pool } from "../client.js";

export type RegisterInput = {
  email: string;
  passwordHash: string;
  phone: string;
  role: "provider" | "client" | "admin";
  adminSubrole?: "super_admin" | "support" | "finance";
  businessName?: string;
};

export type UserRecord = {
  userId: string;
  email: string;
  passwordHash: string;
  phone: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  role: "provider" | "client" | "admin";
  adminSubrole: "super_admin" | "support" | "finance" | null;
  status: "pending_verification" | "active" | "suspended" | "banned";
};

export async function createUser(input: RegisterInput): Promise<UserRecord> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const inserted = await client.query<UserRecord>(
      `
      INSERT INTO users (email, password_hash, phone, role, admin_subrole)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        user_id AS "userId",
        email,
        password_hash AS "passwordHash",
        phone,
        phone_verified AS "phoneVerified",
        email_verified AS "emailVerified",
        role,
        admin_subrole AS "adminSubrole",
        status
      `,
      [input.email, input.passwordHash, input.phone, input.role, input.adminSubrole ?? null]
    );

    const user = inserted.rows[0];

    if (input.role === "provider") {
      await client.query(
        `
        INSERT INTO provider_profiles (user_id, business_name)
        VALUES ($1, $2)
        `,
        [user.userId, input.businessName ?? "Pending business name"]
      );
    }

    if (input.role === "client") {
      await client.query(
        `
        INSERT INTO client_profiles (user_id)
        VALUES ($1)
        `,
        [user.userId]
      );
    }

    await client.query("COMMIT");
    return user;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const result = await pool.query<UserRecord>(
    `
    SELECT
      user_id AS "userId",
      email,
      password_hash AS "passwordHash",
      phone,
      phone_verified AS "phoneVerified",
      email_verified AS "emailVerified",
      role,
      admin_subrole AS "adminSubrole",
      status
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
}

export async function findUserById(userId: string): Promise<UserRecord | null> {
  const result = await pool.query<UserRecord>(
    `
    SELECT
      user_id AS "userId",
      email,
      password_hash AS "passwordHash",
      phone,
      phone_verified AS "phoneVerified",
      email_verified AS "emailVerified",
      role,
      admin_subrole AS "adminSubrole",
      status
    FROM users
    WHERE user_id = $1
    LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function touchLastLogin(userId: string): Promise<void> {
  await pool.query("UPDATE users SET last_login = now() WHERE user_id = $1", [userId]);
}

export async function createVerificationCode(
  userId: string,
  channel: "email" | "phone"
): Promise<string> {
  const code = String(randomInt(100000, 999999));
  await pool.query(
    `
    INSERT INTO verification_codes (user_id, channel, code, expires_at)
    VALUES ($1, $2, $3, now() + interval '10 minutes')
    `,
    [userId, channel, code]
  );

  return code;
}

export async function consumeVerificationCode(
  userId: string,
  channel: "email" | "phone",
  code: string
): Promise<boolean> {
  const result = await pool.query(
    `
    UPDATE verification_codes
    SET consumed_at = now()
    WHERE user_id = $1
      AND channel = $2
      AND code = $3
      AND consumed_at IS NULL
      AND expires_at > now()
    `,
    [userId, channel, code]
  );

  return (result.rowCount ?? 0) > 0;
}

export async function markEmailVerified(userId: string): Promise<void> {
  await pool.query("UPDATE users SET email_verified = true WHERE user_id = $1", [userId]);
}

export async function markPhoneVerified(userId: string): Promise<void> {
  await pool.query("UPDATE users SET phone_verified = true WHERE user_id = $1", [userId]);
}

export async function activateIfFullyVerified(userId: string): Promise<void> {
  await pool.query(
    `
    UPDATE users
    SET status = 'active'
    WHERE user_id = $1
      AND email_verified = true
      AND phone_verified = true
    `,
    [userId]
  );
}
