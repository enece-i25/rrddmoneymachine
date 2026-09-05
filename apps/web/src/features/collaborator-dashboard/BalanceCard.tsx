import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api-client";

export function BalanceCard({ token, balance }: { token: string; balance: { pendingReview: number; available: number; withdrawalThreshold: number } }) {
  const [message, setMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const mutation = useMutation({ mutationFn: () => apiRequest("/withdrawals", { method: "POST", token, body: { amount: balance.available } }), onSuccess: () => { setMessage("Retiro solicitado para el proximo lote."); void queryClient.invalidateQueries({ queryKey: ["collaborator-balance"] }); }, onError: (error) => setMessage(error instanceof Error ? error.message : "No se pudo solicitar el retiro") });
  const progress = Math.min(100, (balance.available / balance.withdrawalThreshold) * 100);
  const missing = Math.max(0, balance.withdrawalThreshold - balance.available);

  return (
    <article className="card stack"><div className="section-heading"><h3>Balance</h3><strong>USD {balance.available.toFixed(2)}</strong></div><div className="progress"><span style={{ width: `${progress}%` }} /></div><small>{missing ? `Faltan USD ${missing.toFixed(2)} para retirar.` : "Umbral alcanzado."}</small><div className="balance-breakdown"><span>Pendiente de revision <strong>USD {balance.pendingReview.toFixed(2)}</strong></span><span>Disponible <strong>USD {balance.available.toFixed(2)}</strong></span></div><button type="button" disabled={balance.available < balance.withdrawalThreshold || mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? "Solicitando..." : "Solicitar retiro"}</button>{message ? <p className={message.startsWith("No") ? "error" : "ok"}>{message}</p> : null}</article>
  );
}
