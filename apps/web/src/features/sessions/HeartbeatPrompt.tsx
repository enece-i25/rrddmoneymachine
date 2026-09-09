import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/api-client";

type Prompt = { sessionId: string; windowExpiresAt: string; verificationType: "tap" | "captcha" | "keyword" };

export function HeartbeatPrompt({ token, prompt, onClose }: { token: string; prompt: Prompt | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [now, setNow] = useState(Date.now());
  const mutation = useMutation({
    mutationFn: () => apiRequest(`/sessions/${prompt!.sessionId}/heartbeat`, { method: "POST", token, body: { passed: true, verificationType: prompt!.verificationType, startedAt: now } }),
    onSuccess: () => { onClose(); void queryClient.invalidateQueries({ queryKey: ["collaborator-summary"] }); void queryClient.invalidateQueries({ queryKey: ["collaborator-balance"] }); }
  });

  useEffect(() => {
    if (!prompt) return;
    if (typeof Notification !== "undefined" && Notification.permission === "default") void Notification.requestPermission();
    if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.visibilityState !== "visible") new Notification("Confirmacion requerida", { body: "Confirma tu presencia en la sesion activa." });
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [prompt]);

  if (!prompt) return null;
  const secondsLeft = Math.max(0, Math.ceil((new Date(prompt.windowExpiresAt).getTime() - now) / 1000));
  return <div className="heartbeat-prompt card stack"><strong>Confirma tu presencia</strong><span>Tiempo restante: {secondsLeft}s</span><button type="button" disabled={secondsLeft === 0 || mutation.isPending} onClick={() => mutation.mutate()}>Estoy presente</button>{mutation.isError ? <p className="error">No se pudo confirmar el heartbeat.</p> : null}</div>;
}
