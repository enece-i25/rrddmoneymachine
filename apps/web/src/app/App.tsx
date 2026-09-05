import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { AppRouter } from "./router";

export default function App() {
  const { user, logout } = useAuth();

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
          {user?.role === "provider" ? <Link to="/provider">Proveedor</Link> : null}
          {user?.role === "client" ? <Link to="/collaborator">Colaborador</Link> : null}
          {user?.role === "admin" ? <Link to="/admin">Admin</Link> : null}
        </nav>
        {user ? (
          <button type="button" onClick={() => void logout()}>
            Salir
          </button>
        ) : null}
      </header>
      <main className="container">
        <AppRouter />
      </main>
    </div>
  );
}
