export function canRequestExceptionalCreditWithdrawal(now: Date, withdrawalEligibleFrom: Date): boolean {
  return now >= withdrawalEligibleFrom;
}
