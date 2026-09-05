import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api-client";
import { useAuth } from "../auth/useAuth";
import { ActiveSessionsList } from "./ActiveSessionsList";
import { DailyMetrics } from "./DailyMetrics";
import { DisputeQueue } from "./DisputeQueue";
import { WithdrawalQueue } from "./WithdrawalQueue";

type Metrics = { revenueToday: number; netMarginToday: number; activeSessions: number; pendingWithdrawals: number };

export function AdminDashboard() {
  const { accessToken, user } = useAuth();
  const metrics = useQuery({ queryKey: ["admin-metrics"], queryFn: () => apiRequest<Metrics>("/admin/dashboard/metrics", { token: accessToken }), enabled: Boolean(accessToken), refetchInterval: 30000 });
  const active = useQuery({ queryKey: ["admin-active"], queryFn: () => apiRequest<any[]>("/admin/sessions/active", { token: accessToken }), enabled: Boolean(accessToken), refetchInterval: 15000 });
  if (!accessToken) return <p>Necesitas iniciar sesion</p>;
  if (metrics.isLoading || active.isLoading) return <p>Cargando panel...</p>;
  return <section className="stack"><div className="page-heading"><div><span className="eyebrow">Control operativo</span><h2>Panel de administrador</h2></div><span className="tier-badge">{user?.adminSubrole ?? "admin"}</span></div><DailyMetrics metrics={metrics.data!} /><ActiveSessionsList sessions={active.data ?? []} /><DisputeQueue token={accessToken} />{user?.adminSubrole !== "support" ? <WithdrawalQueue token={accessToken} /> : <div className="notice">El subrol support no tiene acceso a retiros.</div>}</section>;
}
