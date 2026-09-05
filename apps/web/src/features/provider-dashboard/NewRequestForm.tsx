import { FormEvent, useState } from "react";
import { apiRequest } from "../../lib/api-client";

export function NewRequestForm({ token, onCreated }: { token: string; onCreated: () => void }) {
  const [platform, setPlatform] = useState<"tiktok" | "instagram">("tiktok");
  const [duration, setDuration] = useState(30);
  const [collaborators, setCollaborators] = useState(3);
  const [liveUrl, setLiveUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await apiRequest("/sessions/provider", {
        method: "POST",
        token,
        body: {
          platform,
          scheduledDurationMin: duration,
          collaboratorsRequested: collaborators,
          liveUrl: liveUrl || undefined
        }
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la solicitud");
    }
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
      {error ? <p className="error">{error}</p> : null}
      <button type="submit">Crear solicitud</button>
    </form>
  );
}
