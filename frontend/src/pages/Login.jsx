import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(form);
      nav("/"); // Dashboard
    } catch (e) {
      setErr("Credenciales inválidas");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 360, margin: "40px auto" }}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={onSubmit}>
        <input
          placeholder="usuario o email"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="contraseña"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Entrar</button>
      </form>
      {err && <p style={{ color: "tomato" }}>{err}</p>}
    </div>
  );
}
