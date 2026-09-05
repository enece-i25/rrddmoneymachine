import { FormEvent, useMemo, useState } from "react";
import { findPackage } from "@rrdd/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api-client";
import { RequestSummary } from "./RequestSummary";

export function NewRequestForm({ token, availableCredit }: { token: string; availableCredit: number }) {
  const [platform, setPlatform] = useState<"tiktok" | "instagram">("tiktok");
  const [duration, setDuration] = useState(30);
  const [collaborators, setCollaborators] = useState(3);
  const [startTime, setStartTime] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const packageDefinition = useMemo(() => findPackage(duration, collaborators), [duration, collaborators]);
  const creditApplied = Math.min(availableCredit, packageDefinition?.priceUsd ?? 0);
  const amountUsd = Math.max(0, (packageDefinition?.priceUsd ?? 0) - creditApplied);

  const mutation = useMutation({
    mutationFn: () => apiRequest<{ amountUsd: number; amountArs: number }>("/sessions", {
      method: "POST", token, body: {
        platform, scheduledDurationMin: duration, collaboratorsRequested: collaborators,
        startTime: startTime ? new Date(startTime).toISOString() : undefined,
        liveUrl: liveUrl || undefined
      }
    }),
    onSuccess: (result) => {
      setMessage(`Solicitud creada. Total: USD ${result.amountUsd.toFixed(2)} / ARS ${result.amountArs.toFixed(2)}.`);
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["provider-dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["provider-credits"] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "No se pudo crear la solicitud")
  });

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    setMessage(null);
    if (!packageDefinition) {
      setError("Elegi una combinacion de paquete valida");
      return;
    }
    mutation.mutate();
  }

  return (
    <form className="card stack" onSubmit={onSubmit}>
      <h3>Nueva solicitud de audiencia activa verificada</h3>
      <label>
        Plataforma
        <select value={platform} onChange={(e) => setPlatform(e.target.value as "tiktok" | "instagram")}>
          <option value="tiktok">TikTok</option>
          <option value="instagram">Instagram</option>
        </select>
      </label>
      <label>Fecha y hora<input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></label>
      <label>
        Duracion (min)
        <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={10} />
      </label>
      <label>
        Colaboradores
        <input
          type="number"
          value={collaborators}
          onChange={(e) => setCollaborators(Number(e.target.value))}
          min={1}
        />
      </label>
      <label>
        URL del vivo
        <input value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} />
      </label>
      {packageDefinition ? <RequestSummary packagePrice={packageDefinition.priceUsd} creditApplied={creditApplied} amountUsd={amountUsd} /> : <p className="notice warning">No hay un paquete para esa combinacion.</p>}
      {message ? <p className="ok">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
      <button type="submit" disabled={mutation.isPending || !packageDefinition}>{mutation.isPending ? "Creando..." : "Crear solicitud"}</button>
    </form>
  );
}
