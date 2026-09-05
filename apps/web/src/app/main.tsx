import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "../features/auth/useAuth";
import "../styles/index.css";

export function AppMain() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}
