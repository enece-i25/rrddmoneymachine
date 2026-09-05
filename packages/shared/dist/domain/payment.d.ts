export interface PaymentIn {
    paymentId: string;
    providerId: string;
    sessionId: string | null;
    amountUsd: number;
    amountArs: number;
    fxRateUsed: number;
    mpPaymentId: string | null;
    status: "pending" | "approved" | "rejected";
    createdAt: Date;
}
