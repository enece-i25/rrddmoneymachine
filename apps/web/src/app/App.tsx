import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { HeartbeatPrompt } from "../features/sessions/HeartbeatPrompt";
import { useSocketEvent } from "../features/sessions/useSocket";
import { useQueryClient } from "@tanstack/react-query";
import { AppRouter } from "./router";

export default function App() {
  const { user, accessToken, logout } = useAuth();
  const queryClient = useQueryClient();
  const [heartbeatPrompt, setHeartbeatPrompt] = useState<Parameters<typeof HeartbeatPrompt>[0]["prompt"]>(null);
  useSocketEvent(user?.role === "client" ? accessToken : null, "heartbeat:prompt", setHeartbeatPrompt);
  useSocketEvent(user?.role === "client" ? accessToken : null, "heartbeat:result", () => {
    setHeartbeatPrompt(null);
    void queryClient.invalidateQueries({ queryKey: ["collaborator-summary"] });
    void queryClient.invalidateQueries({ queryKey: ["collaborator-balance"] });
    void queryClient.invalidateQueries({ queryKey: ["upcoming-session"] });
  });

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <h1>rrdd-money</h1>
          <p>Marketplace de audiencia activa verificada</p>
        </div>
        <nav>
          <Link to="/login">Login</Link>
          <Link to="/register">Registro</Link>
          {user?.role === "provider" ? <Link to="/provider/dashboard">Proveedor</Link> : null}
          {user?.role === "client" ? <Link to="/collaborator/dashboard">Colaborador</Link> : null}
          {user?.role === "admin" ? <Link to="/admin/dashboard">Admin</Link> : null}
        </nav>
        {user ? (
          <button type="button" onClick={() => void logout()}>
            Salir
          </button>
        ) : null}
      </header>
      <main className="container">
        {user?.role === "client" && accessToken ? <HeartbeatPrompt token={accessToken} prompt={heartbeatPrompt} onClose={() => setHeartbeatPrompt(null)} /> : null}
        <AppRouter />
      </main>
    </div>
  );
}
