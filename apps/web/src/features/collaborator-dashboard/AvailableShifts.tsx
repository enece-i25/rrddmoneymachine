import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api-client";
import { ShiftItem } from "./ShiftItem";

type Shift = { sessionId: string; platform: string; scheduledDurationMin: number; collaboratorsRequested: number; appliedCount: number; hasCapacity: boolean; startTime: string | null };

export function AvailableShifts({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const shifts = useQuery({ queryKey: ["available-shifts"], queryFn: () => apiRequest<Shift[]>("/collaborators/sessions", { token }), refetchInterval: 30000 });
  const apply = useMutation({ mutationFn: (sessionId: string) => apiRequest(`/collaborators/sessions/${sessionId}/apply`, { method: "POST", token }), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["available-shifts"] }) });
  return (
    <article className="card stack"><div className="section-heading"><h3>Turnos disponibles</h3><span>Actualizacion automatica</span></div>{shifts.isLoading ? <p>Cargando turnos...</p> : <ul className="history-list">{(shifts.data ?? []).map((shift) => <ShiftItem key={shift.sessionId} shift={shift} pending={apply.isPending} onApply={() => apply.mutate(shift.sessionId)} />)}</ul>}{shifts.data?.length === 0 ? <p className="muted">No hay turnos publicados.</p> : null}{apply.isError ? <p className="error">{apply.error instanceof Error ? apply.error.message : "No se pudo postular"}</p> : null}</article>
  );
}
