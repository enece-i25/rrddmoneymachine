export const TIER_POLICY = {
    new: {
        promotionThreshold: 85,
        maintenanceThreshold: 0,
        multiplier: 1.0
    },
    trusted: {
        promotionThreshold: 95,
        maintenanceThreshold: 80,
        multiplier: 1.1
    },
    elite: {
        promotionThreshold: Infinity,
        maintenanceThreshold: 90,
        multiplier: 1.2
    }
};
export function evaluateTier(input) {
    const avg = input.trailingComplianceAvg;
    if (avg >= TIER_POLICY.trusted.promotionThreshold && input.currentTier === "new") {
        return {
            nextTier: "trusted",
            multiplier: TIER_POLICY.trusted.multiplier,
            warningActive: false,
            graceSessionsRemaining: 0,
            shouldSendWarning: false
        };
    }
    if (avg >= 95) {
        return {
            nextTier: "elite",
            multiplier: TIER_POLICY.elite.multiplier,
            warningActive: false,
            graceSessionsRemaining: 0,
            shouldSendWarning: false
        };
    }
    if (input.currentTier === "elite" && avg < TIER_POLICY.elite.maintenanceThreshold) {
        const nextGrace = input.graceSessionsRemaining > 0 ? input.graceSessionsRemaining - 1 : 4;
        const shouldDowngrade = input.graceSessionsRemaining === 1;
        return {
            nextTier: shouldDowngrade ? "trusted" : "elite",
            multiplier: shouldDowngrade ? TIER_POLICY.trusted.multiplier : TIER_POLICY.elite.multiplier,
            warningActive: !shouldDowngrade,
            graceSessionsRemaining: shouldDowngrade ? 0 : nextGrace,
            shouldSendWarning: input.graceSessionsRemaining <= 0
        };
    }
    if (input.currentTier === "trusted" && avg < TIER_POLICY.trusted.maintenanceThreshold) {
        const nextGrace = input.graceSessionsRemaining > 0 ? input.graceSessionsRemaining - 1 : 4;
        const shouldDowngrade = input.graceSessionsRemaining === 1;
        return {
            nextTier: shouldDowngrade ? "new" : "trusted",
            multiplier: shouldDowngrade ? TIER_POLICY.new.multiplier : TIER_POLICY.trusted.multiplier,
            warningActive: !shouldDowngrade,
            graceSessionsRemaining: shouldDowngrade ? 0 : nextGrace,
            shouldSendWarning: input.graceSessionsRemaining <= 0
        };
    }
    return {
        nextTier: input.currentTier,
        multiplier: TIER_POLICY[input.currentTier].multiplier,
        warningActive: false,
        graceSessionsRemaining: 0,
        shouldSendWarning: false
    };
}
