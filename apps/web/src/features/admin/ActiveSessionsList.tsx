import { ActiveSessionItem } from "./ActiveSessionItem";

type Session = { sessionId: string; platform: string; compliancePct: number | null; failedHeartbeats: number; lastHeartbeat: string | null };

export function ActiveSessionsList({ sessions }: { sessions: Session[] }) {
  return <article className="card stack"><div className="section-heading"><h3>Sesiones activas</h3><span>Polling cada 15s</span></div>{sessions.length ? <ul className="history-list">{sessions.map((session) => <ActiveSessionItem key={session.sessionId} session={session} />)}</ul> : <p className="muted">No hay sesiones en curso.</p>}</article>;
}
