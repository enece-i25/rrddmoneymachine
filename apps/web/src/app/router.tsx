import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AdminDashboard } from "../features/admin/AdminDashboard";
import { LoginForm } from "../features/auth/LoginForm";
import { RegisterForm } from "../features/auth/RegisterForm";
import { useAuth } from "../features/auth/useAuth";
import { CollaboratorDashboard } from "../features/collaborator-dashboard/CollaboratorDashboard";
import { ProviderDashboard } from "../features/provider-dashboard/ProviderDashboard";
import { Unauthorized } from "./Unauthorized";
import { AdminHistoryPage } from "../features/admin/AdminHistoryPage";
import { AuditLog } from "../features/admin/AuditLog";

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

function AdminSubroleRoute({ allowed }: { allowed: Array<"super_admin" | "support" | "finance"> }) {
  const { user } = useAuth();
  return user?.adminSubrole && allowed.includes(user.adminSubrole) ? <Outlet /> : <Unauthorized />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRole role="provider" />}>
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/provider/requests/new" element={<ProviderDashboard />} />
        <Route path="/provider/credits" element={<ProviderDashboard />} />
      </Route>

      <Route element={<ProtectedRole role="client" />}>
        <Route path="/collaborator/dashboard" element={<CollaboratorDashboard />} />
        <Route path="/collaborator/shifts" element={<CollaboratorDashboard />} />
        <Route path="/collaborator/balance" element={<CollaboratorDashboard />} />
        <Route path="/collaborator/sessions/active" element={<CollaboratorDashboard />} />
      </Route>

      <Route element={<ProtectedRole role="admin" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/sessions/history" element={<AdminHistoryRoute />} />
        <Route path="/admin/disputes" element={<AdminDashboard />} />
        <Route element={<AdminSubroleRoute allowed={["finance", "super_admin"]} />}>
          <Route path="/admin/withdrawals" element={<AdminDashboard />} />
        </Route>
        <Route element={<AdminSubroleRoute allowed={["super_admin"]} />}>
          <Route path="/admin/audit-log" element={<AuditLogRoute />} />
        </Route>
      </Route>
    </Routes>
  );
}

function AdminHistoryRoute() {
  const { accessToken } = useAuth();
  return accessToken ? <AdminHistoryPage token={accessToken} /> : <Unauthorized />;
}

function AuditLogRoute() {
  const { accessToken } = useAuth();
  return accessToken ? <AuditLog token={accessToken} /> : <Unauthorized />;
}
