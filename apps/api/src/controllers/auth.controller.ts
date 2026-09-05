import type { Request, Response } from "express";
import { z } from "zod";
import {
  login,
  refresh,
  register,
  verifyEmail,
  verifyPhone
} from "../services/auth.service.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(6),
  role: z.enum(["provider", "client", "admin"]),
  adminSubrole: z.enum(["super_admin", "support", "finance"]).optional(),
  businessName: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const verifySchema = z.object({
  userId: z.string().uuid(),
  code: z.string().length(6)
});

const REFRESH_COOKIE_NAME = "rrdd_refresh";

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export async function registerController(req: Request, res: Response): Promise<void> {
  try {
    const input = registerSchema.parse(req.body);
    const result = await register(input);

    res.status(201).json({
      user: {
        userId: result.user.userId,
        email: result.user.email,
        role: result.user.role,
        status: result.user.status
      },
      verification: result.verification
    });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Registration failed" });
  }
}

export async function verifyEmailController(req: Request, res: Response): Promise<void> {
  try {
    const { userId, code } = verifySchema.parse(req.body);
    const user = await verifyEmail(userId, code);
    res.json({ user });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Email verification failed" });
  }
}

export async function verifyPhoneController(req: Request, res: Response): Promise<void> {
  try {
    const { userId, code } = verifySchema.parse(req.body);
    const user = await verifyPhone(userId, code);
    res.json({ user });
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Phone verification failed" });
  }
}

export async function loginController(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await login(email, password);
    setRefreshCookie(res, result.refreshToken);
    res.json({
      accessToken: result.accessToken,
      user: {
        userId: result.user.userId,
        email: result.user.email,
        role: result.user.role,
        adminSubrole: result.user.adminSubrole,
        status: result.user.status,
        emailVerified: result.user.emailVerified,
        phoneVerified: result.user.phoneVerified
      }
    });
  } catch (error) {
    res.status(401).json({ message: error instanceof Error ? error.message : "Login failed" });
  }
}

export async function refreshController(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies[REFRESH_COOKIE_NAME] as string | undefined;
  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token missing" });
    return;
  }

  try {
    const result = await refresh(refreshToken);
    setRefreshCookie(res, result.refreshToken);
    res.json({
      accessToken: result.accessToken,
      user: {
        userId: result.user.userId,
        email: result.user.email,
        role: result.user.role,
        adminSubrole: result.user.adminSubrole,
        status: result.user.status,
        emailVerified: result.user.emailVerified,
        phoneVerified: result.user.phoneVerified
      }
    });
  } catch (error) {
    res.status(401).json({ message: error instanceof Error ? error.message : "Refresh failed" });
  }
}

export async function logoutController(_req: Request, res: Response): Promise<void> {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });

  res.status(204).send();
}
