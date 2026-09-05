import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AdminDashboard } from "../features/admin/AdminDashboard";
import { LoginForm } from "../features/auth/LoginForm";
import { RegisterForm } from "../features/auth/RegisterForm";
import { useAuth } from "../features/auth/useAuth";
import { CollaboratorDashboard } from "../features/collaborator-dashboard/CollaboratorDashboard";
import { ProviderDashboard } from "../features/provider-dashboard/ProviderDashboard";

function ProtectedRole({ role }: { role: "provider" | "client" | "admin" }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    if (user.role === "provider") return <Navigate to="/provider/dashboard" replace />;
    if (user.role === "client") return <Navigate to="/collaborator/dashboard" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />

      <Route element={<ProtectedRole role="provider" />}>
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
      </Route>

      <Route element={<ProtectedRole role="client" />}>
        <Route path="/collaborator/dashboard" element={<CollaboratorDashboard />} />
      </Route>

      <Route element={<ProtectedRole role="admin" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}
