import { FormEvent, useState } from "react";
import { useAuth } from "./useAuth";

export function RegisterForm() {
  const { register, verifyEmail, verifyPhone } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [role, setRole] = useState<"provider" | "client" | "admin">("provider");
  const [userId, setUserId] = useState<string | null>(null);
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [serverEmailOtp, setServerEmailOtp] = useState("");
  const [serverPhoneOtp, setServerPhoneOtp] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      const result = await register({
        email,
        password,
        phone,
        role,
        businessName: role === "provider" ? businessName : undefined
      });
      setUserId(result.userId);
      setServerEmailOtp(result.emailOtp);
      setServerPhoneOtp(result.phoneOtp);
      setMessage("Cuenta creada. Verifica email y telefono con los codigos OTP.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Register failed");
    }
  }

  async function handleVerifyEmail() {
    if (!userId) return;
    setError(null);
    try {
      await verifyEmail(userId, emailCode);
      setMessage("Email verificado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email verify failed");
    }
  }

  async function handleVerifyPhone() {
    if (!userId) return;
    setError(null);
    try {
      await verifyPhone(userId, phoneCode);
      setMessage("Telefono verificado. Ya puedes iniciar sesion.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Phone verify failed");
    }
  }

  return (
    <div className="card stack">
      <h2>Crear cuenta</h2>
      <form className="stack" onSubmit={handleRegister}>
        <label>
          Rol
          <select value={role} onChange={(event) => setRole(event.target.value as "provider" | "client" | "admin")}>
            <option value="provider">Proveedor</option>
            <option value="client">Colaborador</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
        </label>
        <label>
          Telefono
          <input value={phone} onChange={(event) => setPhone(event.target.value)} required />
        </label>
        {role === "provider" ? (
          <label>
            Nombre comercial
            <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} required />
          </label>
        ) : null}
        <button type="submit">Registrar</button>
      </form>

      {userId ? (
        <div className="stack otp-box">
          <p>OTP email (demo): {serverEmailOtp}</p>
          <p>OTP telefono (demo): {serverPhoneOtp}</p>
          <label>
            Codigo email
            <input value={emailCode} onChange={(event) => setEmailCode(event.target.value)} />
          </label>
          <button type="button" onClick={handleVerifyEmail}>
            Verificar email
          </button>
          <label>
            Codigo telefono
            <input value={phoneCode} onChange={(event) => setPhoneCode(event.target.value)} />
          </label>
          <button type="button" onClick={handleVerifyPhone}>
            Verificar telefono
          </button>
        </div>
      ) : null}

      {message ? <p className="ok">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
