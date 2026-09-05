import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

export function LoginForm() {
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user?.role === "provider") return <Navigate to="/provider/dashboard" replace />;
  if (user?.role === "client") return <Navigate to="/collaborator/dashboard" replace />;
  if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card stack" onSubmit={handleSubmit}>
      <h2>Ingresar</h2>
      <label>
        Email
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
      </label>
      <label>
        Password
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
        />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button type="submit" disabled={submitting}>
        {submitting ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
