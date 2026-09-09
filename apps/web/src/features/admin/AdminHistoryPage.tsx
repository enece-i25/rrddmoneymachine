import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api-client";
import { SessionHistoryList } from "./SessionHistoryList";

export function AdminHistoryPage({ token }: { token: string }) {
  const history = useQuery({ queryKey: ["admin-history-page"], queryFn: () => apiRequest<any[]>("/admin/sessions?status=completada,incumplida,disputada", { token }) });
  return <SessionHistoryList sessions={history.data ?? []} />;
}
