import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api-client";
import { useAuth } from "../auth/useAuth";
import { ActiveSessionsList } from "./ActiveSessionsList";
import { DailyMetrics } from "./DailyMetrics";
import { DisputeQueue } from "./DisputeQueue";
import { WithdrawalQueue } from "./WithdrawalQueue";
import { SessionHistoryList } from "./SessionHistoryList";
import { useSocketEvent } from "../sessions/useSocket";

type Metrics = { revenueToday: number; netMarginToday: number; activeSessions: number; pendingWithdrawals: number };

export function AdminDashboard() {
  const { accessToken, user } = useAuth();
  const queryClient = useQueryClient();
  const refreshAdmin = () => { void queryClient.invalidateQueries({ queryKey: ["admin-metrics"] }); void queryClient.invalidateQueries({ queryKey: ["admin-active"] }); void queryClient.invalidateQueries({ queryKey: ["admin-history"] }); void queryClient.invalidateQueries({ queryKey: ["admin-disputes"] }); void queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] }); };
  useSocketEvent(accessToken, "session:created", refreshAdmin);
  useSocketEvent(accessToken, "session:applied", refreshAdmin);
  useSocketEvent(accessToken, "session:status_changed", refreshAdmin);
  useSocketEvent(accessToken, "heartbeat:result", refreshAdmin);
  useSocketEvent(accessToken, "dispute:created", refreshAdmin);
  useSocketEvent(accessToken, "dispute:resolved", refreshAdmin);
  useSocketEvent(accessToken, "withdrawal:updated", refreshAdmin);
  const metrics = useQuery({ queryKey: ["admin-metrics"], queryFn: () => apiRequest<Metrics>("/admin/dashboard/metrics", { token: accessToken }), enabled: Boolean(accessToken), refetchInterval: 30000 });
  const active = useQuery({ queryKey: ["admin-active"], queryFn: () => apiRequest<any[]>("/admin/sessions/active", { token: accessToken }), enabled: Boolean(accessToken), refetchInterval: 60000 });
  const history = useQuery({ queryKey: ["admin-history"], queryFn: () => apiRequest<any[]>("/admin/sessions?status=completada,incumplida,disputada", { token: accessToken }), enabled: Boolean(accessToken), refetchInterval: 60000 });
  if (!accessToken) return <p>Necesitas iniciar sesion</p>;
  if (metrics.isLoading || active.isLoading || history.isLoading) return <p>Cargando panel...</p>;
  return <section className="stack"><div className="page-heading"><div><span className="eyebrow">Control operativo</span><h2>Panel de administrador</h2></div><span className="tier-badge">{user?.adminSubrole ?? "admin"}</span></div><DailyMetrics metrics={metrics.data!} /><ActiveSessionsList sessions={active.data ?? []} /><SessionHistoryList sessions={history.data ?? []} /><DisputeQueue token={accessToken} />{user?.adminSubrole !== "support" ? <WithdrawalQueue token={accessToken} /> : <div className="notice">El subrol support no tiene acceso a retiros.</div>}</section>;
}
