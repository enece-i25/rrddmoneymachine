export type UserRole = "provider" | "client" | "admin";

export type AdminSubrole = "super_admin" | "support" | "finance";

export type UserStatus =
  | "pending_verification"
  | "active"
  | "suspended"
  | "banned";

export interface User {
  userId: string;
  email: string;
  phone: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  role: UserRole;
  adminSubrole: AdminSubrole | null;
  status: UserStatus;
  createdAt: Date;
  lastLogin: Date | null;
}
