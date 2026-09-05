type Shift = { sessionId: string; platform: string; scheduledDurationMin: number; collaboratorsRequested: number; appliedCount: number; hasCapacity: boolean; startTime: string | null };

export function ShiftItem({ shift, onApply, pending }: { shift: Shift; onApply: () => void; pending: boolean }) {
  return <li className={`shift-item ${shift.hasCapacity ? "" : "shift-full"}`}>
    <div><strong>{shift.platform.toUpperCase()} · {shift.scheduledDurationMin} min</strong><small>{shift.startTime ? new Date(shift.startTime).toLocaleString() : "Horario a confirmar"}</small></div>
    <div><small>{shift.appliedCount}/{shift.collaboratorsRequested} cupos</small>{shift.hasCapacity ? <button type="button" onClick={onApply} disabled={pending}>{pending ? "Aplicando..." : "Postularme"}</button> : <span className="muted">Sin cupo</span>}</div>
  </li>;
}
