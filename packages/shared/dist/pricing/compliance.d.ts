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
export declare function calculateCompliance(input: ComplianceInput): ComplianceResult;
