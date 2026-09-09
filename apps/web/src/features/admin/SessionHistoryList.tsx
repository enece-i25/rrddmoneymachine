type Session = { sessionId: string; status: string; platform: string; compliancePct: number | null; endTime: string | null };

export function SessionHistoryList({ sessions }: { sessions: Session[] }) {
  return <article className="card stack"><div className="section-heading"><h3>Historial de sesiones</h3><span>{sessions.length} registros</span></div>{sessions.length ? <ul className="history-list">{sessions.map((session) => <li className="history-item" key={session.sessionId}><div><strong>{session.platform.toUpperCase()} · {session.sessionId.slice(0, 8)}</strong><small>{session.endTime ? new Date(session.endTime).toLocaleString() : "Sin fecha"}</small></div><span>{session.status} · {session.compliancePct === null ? "sin compliance" : `${Number(session.compliancePct).toFixed(1)}%`}</span></li>)}</ul> : <p className="muted">No hay sesiones finalizadas.</p>}</article>;
}
