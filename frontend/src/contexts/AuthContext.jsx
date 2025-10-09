import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  // Cargar perfil si hay token
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
    if (tk) {
      localStorage.setItem("token", tk);
      setToken(tk);
      // Cargar perfil inmediatamente
      const me = await api.get("/auth/profile");
      setUser(me?.data?.data?.user ?? null);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
