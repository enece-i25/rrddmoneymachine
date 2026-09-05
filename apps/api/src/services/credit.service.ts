export function computeCreditWindow(baseDate: Date): {
  expiresAt: Date;
  withdrawalEligibleFrom: Date;
  warningFrom: Date;
} {
  const expiresAt = new Date(baseDate);
  expiresAt.setDate(expiresAt.getDate() + 90);

  const warningFrom = new Date(expiresAt);
  warningFrom.setDate(warningFrom.getDate() - 30);

  const withdrawalEligibleFrom = new Date(expiresAt);
  withdrawalEligibleFrom.setDate(withdrawalEligibleFrom.getDate() - 10);

  return { expiresAt, withdrawalEligibleFrom, warningFrom };
}
