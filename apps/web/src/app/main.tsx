import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError } from "../lib/api-client";
import App from "./App";
import { AuthProvider } from "../features/auth/useAuth";
import "../styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: true
    },
    mutations: {
      retry: false
    }
  }
});

export function AppMain() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider><App /></AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
