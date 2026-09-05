import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api-client";
import { DisputeItem } from "./DisputeItem";

type Dispute = { sessionId: string; compliancePct: number | null; reportedAt: string | null };

export function DisputeQueue({ token }: { token: string }) {
  const disputes = useQuery({ queryKey: ["admin-disputes"], queryFn: () => apiRequest<Dispute[]>("/admin/disputes?status=pending", { token }), refetchInterval: 30000 });
  return (
    <article className="card stack"><div className="section-heading"><h3>Cola de disputas</h3><span>{disputes.data?.length ?? 0} pendientes</span></div>{disputes.data?.length ? <ul className="history-list">{disputes.data.map((dispute) => <DisputeItem key={dispute.sessionId} dispute={dispute} token={token} />)}</ul> : <p className="muted">No hay disputas pendientes.</p>}</article>
  );
}
