export function calculateCompliance(input) {
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
