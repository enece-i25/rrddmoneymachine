export function TierBadge({ tier, multiplier }: { tier: string; multiplier: number }) {
  return <span className={`tier-badge tier-${tier}`}>{tier} · {multiplier.toFixed(2)}x</span>;
}
