export type Tier = "new" | "trusted" | "elite";
export interface TierPolicy {
    promotionThreshold: number;
    maintenanceThreshold: number;
    multiplier: number;
}
export declare const TIER_POLICY: Record<Tier, TierPolicy>;
export interface TierEvaluationInput {
    currentTier: Tier;
    trailingComplianceAvg: number;
    graceSessionsRemaining: number;
}
export interface TierEvaluationResult {
    nextTier: Tier;
    multiplier: number;
    warningActive: boolean;
    graceSessionsRemaining: number;
    shouldSendWarning: boolean;
}
export declare function evaluateTier(input: TierEvaluationInput): TierEvaluationResult;
