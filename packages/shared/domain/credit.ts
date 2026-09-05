export type ProviderCreditStatus =
  | "available"
  | "consumed"
  | "expiring_soon"
  | "expired"
  | "withdrawal_requested"
  | "withdrawn";

export interface ProviderCredit {
  creditId: string;
  providerId: string;
  sessionId: string | null;
  amount: number;
  status: ProviderCreditStatus;
  createdAt: Date;
  expiresAt: Date;
  warningSentAt: Date | null;
  consumedAt: Date | null;
  consumedInSessionId: string | null;
  withdrawalEligibleFrom: Date;
}
