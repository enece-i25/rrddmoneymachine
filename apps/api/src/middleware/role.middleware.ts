import type { NextFunction, Request, Response } from "express";

type Role = "provider" | "client" | "admin";

export function roleMiddleware(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden for this role" });
      return;
    }

    next();
  };
}
