import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  userId: uuid("user_id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: varchar("phone", { length: 30 }),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  emailVerified: boolean("email_verified").notNull().default(false),
  role: varchar("role", { length: 20 }).notNull(),
  adminSubrole: varchar("admin_subrole", { length: 20 }),
  status: varchar("status", { length: 30 }).notNull().default("pending_verification"),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLogin: timestamp("last_login", { withTimezone: true })
});

export const providerProfiles = pgTable("provider_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.userId, { onDelete: "cascade" }),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  tiktokHandle: varchar("tiktok_handle", { length: 100 }),
  category: varchar("category", { length: 30 }),
  verified: boolean("verified").notNull().default(false),
  paymentMethodId: varchar("payment_method_id", { length: 255 })
});

export const clientProfiles = pgTable("client_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.userId, { onDelete: "cascade" }),
  tiktokHandle: varchar("tiktok_handle", { length: 100 }),
  reputationScore: numeric("reputation_score", { precision: 5, scale: 2 }).notNull().default("0"),
  totalSessionsCompleted: integer("total_sessions_completed").notNull().default(0),
  totalSessionsFailed: integer("total_sessions_failed").notNull().default(0),
  verificationTier: varchar("verification_tier", { length: 20 }).notNull().default("new"),
  tierPayMultiplier: numeric("tier_pay_multiplier", { precision: 4, scale: 2 }).notNull().default("1.00"),
  trailingComplianceAvg: numeric("trailing_compliance_avg", { precision: 5, scale: 2 }),
  tierWarningActive: boolean("tier_warning_active").notNull().default(false),
  tierWarningSentAt: timestamp("tier_warning_sent_at", { withTimezone: true }),
  graceSessionsRemaining: integer("grace_sessions_remaining").notNull().default(0),
  cbuAlias: varchar("cbu_alias", { length: 50 })
});

export const sessions = pgTable(
  "sessions",
  {
    sessionId: uuid("session_id").defaultRandom().primaryKey(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => users.userId),
    clientId: uuid("client_id").references(() => users.userId),
    platform: varchar("platform", { length: 20 }).notNull(),
    scheduledDurationMin: integer("scheduled_duration_min").notNull(),
    collaboratorsRequested: integer("collaborators_requested").notNull(),
    liveUrl: text("live_url"),
    startTime: timestamp("start_time", { withTimezone: true }),
    endTime: timestamp("end_time", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("programada"),
    compliancePct: numeric("compliance_pct", { precision: 5, scale: 2 }),
    amountEarned: numeric("amount_earned", { precision: 10, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    idxProvider: index("idx_sessions_provider").on(table.providerId),
    idxClient: index("idx_sessions_client").on(table.clientId),
    idxStatus: index("idx_sessions_status").on(table.status)
  })
);
