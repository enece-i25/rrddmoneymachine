import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api-client";
import { useAuth } from "../auth/useAuth";
import { CreditBalanceCard } from "./CreditBalanceCard";
import { NewRequestForm } from "./NewRequestForm";

type Summary = {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  disputedSessions: number;
  pendingCredits: number;
};

export function ProviderDashboard() {
  const { accessToken } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadSummary() {
    if (!accessToken) return;

    try {
      const data = await apiRequest<Summary>("/sessions/provider/summary", { token: accessToken });
      setSummary(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el dashboard");
    }
  }

  useEffect(() => {
    void loadSummary();
  }, [accessToken]);

  if (!accessToken) {
    return <p>Necesitas iniciar sesion</p>;
  }

  return (
    <section className="stack">
      <h2>Panel de proveedor</h2>
      {error ? <p className="error">{error}</p> : null}
      {summary ? (
        <div className="grid-cards">
          <article className="card stack">
            <h3>Sesiones totales</h3>
            <p className="metric">{summary.totalSessions}</p>
          </article>
          <article className="card stack">
            <h3>En curso</h3>
            <p className="metric">{summary.activeSessions}</p>
          </article>
          <article className="card stack">
            <h3>Completadas</h3>
            <p className="metric">{summary.completedSessions}</p>
          </article>
          <article className="card stack">
            <h3>Disputadas</h3>
            <p className="metric">{summary.disputedSessions}</p>
          </article>
        </div>
      ) : null}

      <CreditBalanceCard pendingCredits={summary?.pendingCredits ?? 0} />
      <NewRequestForm token={accessToken} onCreated={() => void loadSummary()} />
    </section>
  );
}
