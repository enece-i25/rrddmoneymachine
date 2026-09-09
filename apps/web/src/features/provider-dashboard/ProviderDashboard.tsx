import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api-client";
import { useAuth } from "../auth/useAuth";
import { CreditBalanceCard } from "./CreditBalanceCard";
import { MetricsSummary } from "./MetricsSummary";
import { NewRequestForm } from "./NewRequestForm";
import { RequestHistoryList } from "./RequestHistoryList";
import { useSocketEvent } from "../sessions/useSocket";

type Dashboard = { metrics: { sessionsThisMonth: number; averageCompliance: number; investedThisMonth: number }; history: any[] };
type Credits = { total: number; credits: any[] };

export function ProviderDashboard() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const refresh = () => { void queryClient.invalidateQueries({ queryKey: ["provider-dashboard"] }); void queryClient.invalidateQueries({ queryKey: ["provider-credits"] }); };
  useSocketEvent(accessToken, "session:applied", refresh);
  useSocketEvent(accessToken, "session:status_changed", refresh);
  useSocketEvent(accessToken, "balance:updated", refresh);
  useSocketEvent(accessToken, "dispute:resolved", refresh);
  const dashboard = useQuery({ queryKey: ["provider-dashboard"], queryFn: () => apiRequest<Dashboard>("/provider/dashboard", { token: accessToken }), enabled: Boolean(accessToken), refetchInterval: 30000 });
  const credits = useQuery({ queryKey: ["provider-credits"], queryFn: () => apiRequest<Credits>("/credits/me", { token: accessToken }), enabled: Boolean(accessToken), refetchInterval: 30000 });

  if (!accessToken) {
    return <p>Necesitas iniciar sesion</p>;
  }

  if (dashboard.isLoading || credits.isLoading) return <p>Cargando panel...</p>;
  if (dashboard.isError || credits.isError) return <p className="error">No se pudo cargar el panel. {dashboard.error?.message ?? credits.error?.message}</p>;
  const dashboardData = dashboard.data!;
  const creditData = credits.data!;

  return (
    <section className="stack">
      <div className="page-heading"><div><span className="eyebrow">Operacion</span><h2>Panel de proveedor</h2></div><span className="live-pill">Datos en vivo</span></div>
      <MetricsSummary metrics={dashboardData.metrics} />
      <CreditBalanceCard total={creditData.total} credits={creditData.credits} />
      <NewRequestForm token={accessToken} availableCredit={creditData.total} />
      <RequestHistoryList items={dashboardData.history} />
    </section>
  );
}
