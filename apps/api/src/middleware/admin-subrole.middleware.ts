import type { NextFunction, Request, Response } from "express";

type AdminSubrole = "super_admin" | "support" | "finance";

export function adminSubroleMiddleware(...allowed: AdminSubrole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== "admin" || !req.user.adminSubrole || !allowed.includes(req.user.adminSubrole)) {
      res.status(403).json({ message: "Insufficient admin subrole permissions" });
      return;
    }
    next();
  };
}
