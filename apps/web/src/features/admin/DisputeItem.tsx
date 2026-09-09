import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api-client";

type Dispute = { disputeId: string; sessionId: string; compliancePct: number | null; createdAt: string | null; reason?: string };

export function DisputeItem({ dispute, token }: { dispute: Dispute; token: string }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({ mutationFn: (resolution: "provider" | "client" | "partial") => apiRequest(`/admin/disputes/${dispute.disputeId}/resolve`, { method: "POST", token, body: { resolution } }), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["admin-disputes"] }) });
  return <li className="shift-item"><div><strong>Sesion {dispute.sessionId.slice(0, 8)}</strong><small>Reportada: {dispute.createdAt ? new Date(dispute.createdAt).toLocaleString() : "sin fecha"}</small><small>Compliance: {dispute.compliancePct === null ? "sin dato" : `${Number(dispute.compliancePct).toFixed(1)}%`}</small>{dispute.reason ? <small>{dispute.reason}</small> : null}</div><div className="button-row"><button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate("provider")}>Proveedor</button><button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate("client")}>Colaborador</button><button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate("partial")}>Parcial</button></div></li>;
}
