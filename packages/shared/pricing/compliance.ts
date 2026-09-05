export interface ComplianceInput {
  sessionTotalMinutes: number;
  unconfirmedWindows: number;
  intervalMinutes: number;
  agreedMinutes: number;
}

export interface ComplianceResult {
  effectiveMinutes: number;
  compliancePct: number;
  payoutMultiplier: number;
  status: "full_payment" | "proportional_payment" | "no_payment";
}

export function calculateCompliance(input: ComplianceInput): ComplianceResult {
  const windowsPenalty = input.unconfirmedWindows * input.intervalMinutes;
  const effectiveMinutes = Math.max(0, input.sessionTotalMinutes - windowsPenalty);
  const compliancePct = input.agreedMinutes > 0 ? (effectiveMinutes / input.agreedMinutes) * 100 : 0;

  if (compliancePct >= 80) {
    return {
      effectiveMinutes,
      compliancePct,
      payoutMultiplier: 1,
      status: "full_payment"
    };
  }

  if (compliancePct >= 50) {
    return {
      effectiveMinutes,
      compliancePct,
      payoutMultiplier: compliancePct / 100,
      status: "proportional_payment"
    };
  }

  return {
    effectiveMinutes,
    compliancePct,
    payoutMultiplier: 0,
    status: "no_payment"
  };
}
