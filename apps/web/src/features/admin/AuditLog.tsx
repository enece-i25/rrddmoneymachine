import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api-client";

export function AuditLog({ token }: { token: string }) {
  const query = useQuery({ queryKey: ["audit-log"], queryFn: () => apiRequest<any[]>("/admin/audit-log", { token }) });
  return <article className="card stack"><h2>Audit log</h2>{(query.data ?? []).map((entry) => <div className="history-item" key={entry.auditId}><span>{entry.action}</span><small>{new Date(entry.createdAt).toLocaleString()}</small></div>)}</article>;
}
