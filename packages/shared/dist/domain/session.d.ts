export type SessionPlatform = "tiktok" | "instagram";
export type SessionStatus = "programada" | "en_curso" | "pausada" | "completada" | "incumplida" | "disputada";
export interface Session {
    sessionId: string;
    providerId: string;
    clientId: string | null;
    platform: SessionPlatform;
    scheduledDurationMin: number;
    collaboratorsRequested: number;
    liveUrl: string | null;
    startTime: Date | null;
    endTime: Date | null;
    status: SessionStatus;
    compliancePct: number | null;
    amountEarned: number | null;
    createdAt: Date;
}
