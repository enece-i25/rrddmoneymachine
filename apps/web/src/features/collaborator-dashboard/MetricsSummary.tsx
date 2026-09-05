export function MetricsSummary({ completed, compliance, reputation }: { completed: number; compliance: number; reputation: number }) {
  return <div className="grid-cards">
    <article className="card stack"><span className="eyebrow">Sesiones completadas</span><strong className="metric">{completed}</strong></article>
    <article className="card stack"><span className="eyebrow">Cumplimiento promedio</span><strong className="metric">{compliance.toFixed(1)}%</strong></article>
    <article className="card stack"><span className="eyebrow">Reputacion</span><strong className="metric">{reputation.toFixed(1)}</strong></article>
  </div>;
}
