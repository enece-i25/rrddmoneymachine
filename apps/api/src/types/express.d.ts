import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: "provider" | "client" | "admin";
        adminSubrole: "super_admin" | "support" | "finance" | null;
        status: "pending_verification" | "active" | "suspended" | "banned";
      };
    }
  }
}

export {};
