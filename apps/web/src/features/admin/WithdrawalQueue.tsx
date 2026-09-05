import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api-client";

type Withdrawal = { withdrawalId: string; clientId: string; amount: number; requestedAt: string };

export function WithdrawalQueue({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const withdrawals = useQuery({ queryKey: ["admin-withdrawals"], queryFn: () => apiRequest<Withdrawal[]>("/admin/withdrawals?status=requested", { token }) });
  const process = useMutation({ mutationFn: () => apiRequest("/admin/withdrawals/process-batch", { method: "POST", token }), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] }) });
  return (
    <article className="card stack"><div className="section-heading"><h3>Cola de retiros</h3><button type="button" disabled={process.isPending || !withdrawals.data?.length} onClick={() => process.mutate()}>Procesar lote</button></div>{withdrawals.data?.length ? <ul className="history-list">{withdrawals.data.map((item) => <li className="shift-item" key={item.withdrawalId}><span>{item.clientId.slice(0, 8)}</span><strong>USD {item.amount.toFixed(2)}</strong></li>)}</ul> : <p className="muted">No hay retiros pendientes.</p>}</article>
  );
}
