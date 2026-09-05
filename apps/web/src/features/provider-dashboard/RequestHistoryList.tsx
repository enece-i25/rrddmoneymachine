import { RequestHistoryItem } from "./RequestHistoryItem";

type HistoryItem = {
  sessionId: string;
  platform: string;
  scheduledDurationMin: number;
  status: string;
  startTime: string | null;
  compliancePct: number | null;
};

export function RequestHistoryList({ items }: { items: HistoryItem[] }) {
  return (
    <article className="card stack">
      <div className="section-heading"><h3>Historial de solicitudes</h3><span>{items.length} registros</span></div>
      {items.length ? (
        <ul className="history-list">
          {items.map((item) => <RequestHistoryItem key={item.sessionId} item={item} />)}
        </ul>
      ) : <p className="muted">Todavia no hay solicitudes registradas.</p>}
    </article>
  );
}
