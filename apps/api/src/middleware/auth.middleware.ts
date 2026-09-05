import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

function getToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.replace("Bearer ", "");
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = getToken(req);
  if (!token) {
    res.status(401).json({ message: "Missing access token" });
    return;
  }

  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    res.status(500).json({ message: "JWT_ACCESS_SECRET missing" });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as jwt.JwtPayload;
    req.user = {
      userId: String(payload.sub),
      role: payload.role as "provider" | "client" | "admin",
      adminSubrole: (payload.adminSubrole as "super_admin" | "support" | "finance" | null) ?? null,
      status: (payload.status as "pending_verification" | "active" | "suspended" | "banned") ?? "pending_verification"
    };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired access token" });
  }
}
