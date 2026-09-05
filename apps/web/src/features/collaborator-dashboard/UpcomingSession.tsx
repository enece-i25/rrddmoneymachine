export function UpcomingSession({ session }: { session: { platform: string; scheduledDurationMin: number; startTime: string | null; liveUrl: string | null } | null }) {
  if (!session) return <article className="card"><p className="muted">No tenes una proxima sesion confirmada.</p></article>;
  return <article className="card stack"><span className="eyebrow">Proxima sesion</span><h3>{session.platform.toUpperCase()} · {session.scheduledDurationMin} min</h3><p>{session.startTime ? new Date(session.startTime).toLocaleString() : "Horario a confirmar"}</p>{session.liveUrl ? <a href={session.liveUrl} target="_blank" rel="noreferrer">Abrir vivo</a> : null}</article>;
}
