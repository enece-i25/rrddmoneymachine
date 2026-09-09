import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api-client";
import { useAuth } from "../auth/useAuth";
import { BalanceCard } from "./BalanceCard";
import { AvailableShifts } from "./AvailableShifts";
import { MetricsSummary } from "./MetricsSummary";
import { TierBadge } from "./TierBadge";
import { UpcomingSession } from "./UpcomingSession";
import { useSocketEvent } from "../sessions/useSocket";

type Summary = { tier: string; multiplier: number; averageCompliance: number; reputation: number; completedSessions: number; tierWarningActive: boolean; graceSessionsRemaining: number };
type Balance = { pendingReview: number; available: number; withdrawalThreshold: number };
type Upcoming = { platform: string; scheduledDurationMin: number; startTime: string | null; liveUrl: string | null } | null;

export function CollaboratorDashboard() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  useSocketEvent(accessToken, "heartbeat:result", () => { void queryClient.invalidateQueries({ queryKey: ["collaborator-summary"] }); void queryClient.invalidateQueries({ queryKey: ["collaborator-balance"] }); void queryClient.invalidateQueries({ queryKey: ["available-shifts"] }); });
  useSocketEvent(accessToken, "session:status_changed", () => { void queryClient.invalidateQueries({ queryKey: ["upcoming-session"] }); void queryClient.invalidateQueries({ queryKey: ["collaborator-summary"] }); });
  useSocketEvent(accessToken, "balance:updated", () => void queryClient.invalidateQueries({ queryKey: ["collaborator-balance"] }));
  useSocketEvent(accessToken, "withdrawal:updated", () => void queryClient.invalidateQueries({ queryKey: ["collaborator-balance"] }));
  const summary = useQuery({ queryKey: ["collaborator-summary"], queryFn: () => apiRequest<Summary>("/collaborators/me/summary", { token: accessToken }), enabled: Boolean(accessToken) });
  const balance = useQuery({ queryKey: ["collaborator-balance"], queryFn: () => apiRequest<Balance>("/collaborators/me/balance", { token: accessToken }), enabled: Boolean(accessToken), refetchInterval: 30000 });
  const upcoming = useQuery({ queryKey: ["upcoming-session"], queryFn: () => apiRequest<Upcoming>("/collaborators/me/upcoming", { token: accessToken }), enabled: Boolean(accessToken), refetchInterval: 30000 });
  if (!accessToken) return <p>Necesitas iniciar sesion</p>;
  if (summary.isLoading || balance.isLoading || upcoming.isLoading) return <p>Cargando panel...</p>;
  if (summary.isError || balance.isError || upcoming.isError) return <p className="error">No se pudo cargar el panel del colaborador.</p>;
  const data = summary.data!;
  const balanceData = balance.data!;
  const upcomingData = upcoming.data!;
  return <section className="stack"><div className="page-heading"><div><span className="eyebrow">Participacion</span><h2>Panel de colaborador</h2></div><TierBadge tier={data.tier} multiplier={data.multiplier} /></div><MetricsSummary completed={data.completedSessions} compliance={data.averageCompliance} reputation={data.reputation} />{data.tierWarningActive ? <div className="notice warning">Tu promedio es {data.averageCompliance.toFixed(1)}%. Te quedan {data.graceSessionsRemaining} sesiones de gracia.</div> : null}<BalanceCard token={accessToken} balance={balanceData} /><UpcomingSession session={upcomingData} /><AvailableShifts token={accessToken} /></section>;
}
