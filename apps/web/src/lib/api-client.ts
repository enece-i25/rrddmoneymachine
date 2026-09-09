const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  refreshAttempted?: boolean;
};

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

type AuthHandlers = {
  onAccessToken: (token: string) => void;
  onSessionExpired: () => void;
};

let authHandlers: AuthHandlers | null = null;
let refreshPromise: Promise<string> | null = null;

export function configureAuthHandlers(handlers: AuthHandlers): void {
  authHandlers = handlers;
}

function isAuthEndpoint(path: string): boolean {
  return path.startsWith("/auth/");
}

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include"
    }).then(async (response) => {
      if (!response.ok) {
        throw new ApiError(response.status, "Session expired");
      }
      const payload = (await response.json()) as { accessToken: string };
      authHandlers?.onAccessToken(payload.accessToken);
      return payload.accessToken;
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    credentials: "include",
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { message?: string };
    const error = new ApiError(response.status, payload.message ?? `Request failed (${response.status})`);
    if (response.status === 401 && !isAuthEndpoint(path) && !options.refreshAttempted && authHandlers) {
      try {
        const token = await refreshAccessToken();
        return apiRequest<T>(path, { ...options, token, refreshAttempted: true });
      } catch {
        authHandlers.onSessionExpired();
      }
    }
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
