type HistoryItem = {
  sessionId: string;
  platform: string;
  scheduledDurationMin: number;
  status: string;
  startTime: string | null;
  compliancePct: number | null;
};

const statusLabels: Record<string, string> = {
  completada: "Completada",
  programada: "Programada",
  disputada: "Disputada",
  en_curso: "En curso",
  incumplida: "Incumplida"
};

export function RequestHistoryItem({ item }: { item: HistoryItem }) {
  return (
    <li className={`history-item status-${item.status}`}>
      <div>
        <strong>{item.platform.toUpperCase()} · {item.scheduledDurationMin} min</strong>
        <small>{item.startTime ? new Date(item.startTime).toLocaleString() : "Sin fecha definida"}</small>
      </div>
      <div className="history-status">
        <span>{statusLabels[item.status] ?? item.status}</span>
        <small>{item.compliancePct === null ? "Sin compliance" : `${Number(item.compliancePct).toFixed(1)}%`}</small>
      </div>
    </li>
  );
}
