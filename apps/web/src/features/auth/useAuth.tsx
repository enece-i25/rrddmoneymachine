import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { apiRequest } from "../../lib/api-client";

type Role = "provider" | "client" | "admin";

type User = {
  userId: string;
  email: string;
  role: Role;
  status: "pending_verification" | "active" | "suspended" | "banned";
  emailVerified: boolean;
  phoneVerified: boolean;
};

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    phone: string;
    role: Role;
    businessName?: string;
  }) => Promise<{ userId: string; emailOtp: string; phoneOtp: string }>;
  verifyEmail: (userId: string, code: string) => Promise<void>;
  verifyPhone: (userId: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const payload = await apiRequest<{ accessToken: string; user: User }>("/auth/refresh", {
      method: "POST"
    });
    setAccessToken(payload.accessToken);
    setUser(payload.user);
  }, []);

  useEffect(() => {
    refresh()
      .catch(() => {
        setAccessToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const payload = await apiRequest<{ accessToken: string; user: User }>("/auth/login", {
      method: "POST",
      body: { email, password }
    });

    setAccessToken(payload.accessToken);
    setUser(payload.user);
  }, []);

  const register = useCallback(
    async (payload: {
      email: string;
      password: string;
      phone: string;
      role: Role;
      businessName?: string;
    }) => {
      const response = await apiRequest<{
        user: { userId: string };
        verification: { emailOtp: string; phoneOtp: string };
      }>("/auth/register", {
        method: "POST",
        body: payload
      });

      return {
        userId: response.user.userId,
        emailOtp: response.verification.emailOtp,
        phoneOtp: response.verification.phoneOtp
      };
    },
    []
  );

  const verifyEmail = useCallback(async (userId: string, code: string) => {
    await apiRequest("/auth/verify-email", {
      method: "POST",
      body: { userId, code }
    });
  }, []);

  const verifyPhone = useCallback(async (userId: string, code: string) => {
    await apiRequest("/auth/verify-phone", {
      method: "POST",
      body: { userId, code }
    });
  }, []);

  const logout = useCallback(async () => {
    await apiRequest("/auth/logout", { method: "POST" });
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      loading,
      login,
      register,
      verifyEmail,
      verifyPhone,
      logout,
      refresh
    }),
    [accessToken, loading, login, logout, refresh, register, user, verifyEmail, verifyPhone]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
