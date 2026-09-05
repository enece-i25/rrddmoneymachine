import { evaluateTier, type Tier, type TierEvaluationResult } from "@rrdd/shared";

export function evaluateTrailingTier(
  currentTier: Tier,
  trailingComplianceAvg: number,
  graceSessionsRemaining: number
): TierEvaluationResult {
  return evaluateTier({
    currentTier,
    trailingComplianceAvg,
    graceSessionsRemaining
  });
}
