type Metrics = { revenueToday: number; netMarginToday: number; activeSessions: number; pendingWithdrawals: number };

export function DailyMetrics({ metrics }: { metrics: Metrics }) {
  return <div className="grid-cards"><article className="card stack"><span className="eyebrow">Ingresos del dia</span><strong className="metric">ARS {metrics.revenueToday.toFixed(2)}</strong></article><article className="card stack"><span className="eyebrow">Margen neto</span><strong className="metric">ARS {metrics.netMarginToday.toFixed(2)}</strong></article><article className="card stack"><span className="eyebrow">Sesiones activas</span><strong className="metric">{metrics.activeSessions}</strong></article><article className="card stack"><span className="eyebrow">Retiros pendientes</span><strong className="metric">{metrics.pendingWithdrawals}</strong></article></div>;
}
