import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const { data } = await api.get("/auth/profile");
        setUser(data?.data?.user ?? null);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  async function login({ username, password }) {
    const { data } = await api.post("/auth/login", { username, password });
    const tk = data?.data?.token;
    if (!tk) throw new Error("No token");
    localStorage.setItem("token", tk);
    setToken(tk);
    return tk;
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);
    return data;
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
