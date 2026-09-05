import argon2 from "argon2";
import jwt from "jsonwebtoken";
import {
  activateIfFullyVerified,
  consumeVerificationCode,
  createUser,
  createVerificationCode,
  findUserByEmail,
  findUserById,
  markEmailVerified,
  markPhoneVerified,
  touchLastLogin,
  type RegisterInput,
  type UserRecord
} from "../db/repositories/users.repository.js";

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";

function mustEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

const accessSecret = mustEnv("JWT_ACCESS_SECRET");
const refreshSecret = mustEnv("JWT_REFRESH_SECRET");

function issueTokens(user: UserRecord): AuthTokens {
  const accessToken = jwt.sign(
    {
      sub: user.userId,
      role: user.role,
      adminSubrole: user.adminSubrole ?? null,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified
    },
    accessSecret,
    { expiresIn: ACCESS_TTL }
  );

  const refreshToken = jwt.sign(
    {
      sub: user.userId,
      role: user.role
    },
    refreshSecret,
    { expiresIn: REFRESH_TTL }
  );

  return { accessToken, refreshToken };
}

export async function register(input: Omit<RegisterInput, "passwordHash"> & { password: string }) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new Error("Email already in use");
  }

  const passwordHash = await argon2.hash(input.password);
  const user = await createUser({
    email: input.email,
    passwordHash,
    phone: input.phone,
    role: input.role,
    adminSubrole: input.adminSubrole,
    businessName: input.businessName
  });

  const emailOtp = await createVerificationCode(user.userId, "email");
  const phoneOtp = await createVerificationCode(user.userId, "phone");

  return {
    user,
    verification: {
      emailOtp,
      phoneOtp
    }
  };
}

export async function verifyEmail(userId: string, code: string) {
  const consumed = await consumeVerificationCode(userId, "email", code);
  if (!consumed) {
    throw new Error("Invalid or expired email code");
  }

  await markEmailVerified(userId);
  await activateIfFullyVerified(userId);
  return await findUserById(userId);
}

export async function verifyPhone(userId: string, code: string) {
  const consumed = await consumeVerificationCode(userId, "phone", code);
  if (!consumed) {
    throw new Error("Invalid or expired phone code");
  }

  await markPhoneVerified(userId);
  await activateIfFullyVerified(userId);
  return await findUserById(userId);
}

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValid = await argon2.verify(user.passwordHash, password);
  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  await touchLastLogin(user.userId);
  return {
    user,
    ...issueTokens(user)
  };
}

export async function refresh(refreshToken: string) {
  const payload = jwt.verify(refreshToken, refreshSecret) as jwt.JwtPayload;
  const sub = payload.sub;
  if (typeof sub !== "string") {
    throw new Error("Invalid refresh token");
  }

  const user = await findUserById(sub);
  if (!user) {
    throw new Error("User not found");
  }

  return {
    user,
    ...issueTokens(user)
  };
}
