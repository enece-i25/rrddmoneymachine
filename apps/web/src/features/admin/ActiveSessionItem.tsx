type Session = { sessionId: string; platform: string; compliancePct: number | null; failedHeartbeats: number; lastHeartbeat: string | null };

export function ActiveSessionItem({ session }: { session: Session }) {
  const warning = session.failedHeartbeats > 0;
  return <li className={`shift-item ${warning ? "session-warning" : ""}`}><div><strong>{session.platform.toUpperCase()} · {session.sessionId.slice(0, 8)}</strong><small>Ultimo heartbeat: {session.lastHeartbeat ? new Date(session.lastHeartbeat).toLocaleTimeString() : "sin registro"}</small></div><div><span>{session.compliancePct === null ? "Sin compliance" : `${Number(session.compliancePct).toFixed(1)}%`}</span>{warning ? <strong className="error">{session.failedHeartbeats} fallos</strong> : <small className="ok">Heartbeat OK</small>}</div></li>;
}
