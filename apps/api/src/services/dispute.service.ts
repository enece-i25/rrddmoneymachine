export function disputeWindowEndsAt(sessionEndedAt: Date): Date {
  const deadline = new Date(sessionEndedAt);
  deadline.setHours(deadline.getHours() + 48);
  return deadline;
}

export function canReleasePendingBalance(now: Date, sessionEndedAt: Date): boolean {
  return now >= disputeWindowEndsAt(sessionEndedAt);
}
