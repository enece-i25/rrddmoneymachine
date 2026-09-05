type Metrics = {
  sessionsThisMonth: number;
  averageCompliance: number;
  investedThisMonth: number;
};

export function MetricsSummary({ metrics }: { metrics: Metrics }) {
  return (
    <div className="grid-cards">
      <article className="card stack">
        <span className="eyebrow">Sesiones del mes</span>
        <strong className="metric">{metrics.sessionsThisMonth}</strong>
      </article>
      <article className="card stack">
        <span className="eyebrow">Cumplimiento promedio</span>
        <strong className="metric">{metrics.averageCompliance.toFixed(1)}%</strong>
      </article>
      <article className="card stack">
        <span className="eyebrow">Invertido este mes</span>
        <strong className="metric">USD {metrics.investedThisMonth.toFixed(2)}</strong>
      </article>
    </div>
  );
}
