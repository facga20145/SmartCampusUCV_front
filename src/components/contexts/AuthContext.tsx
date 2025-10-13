import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

// ⚙️ Ajusta esta URL a tu API NestJS
const API_URL = "http://localhost:3000/auth";

type User = {
  id: string;
  email: string;
  fullName?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🧠 Cargar sesión guardada (token + usuario)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchProfile(token: string) {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al cargar perfil");
      const user = await res.json();
      setUser(user);
    } catch (error) {
      console.error(error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }

  // 🔐 Iniciar sesión
  async function signIn(email: string, password: string) {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Credenciales incorrectas");

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      await fetchProfile(data.access_token);
      return { error: null };
    } catch (error) {
      console.error("Error en signIn:", error);
      return { error: error as Error };
    }
  }

  // 🧾 Registro de usuario
  async function signUp(email: string, password: string, fullName: string) {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });

      if (!res.ok) throw new Error("Error al registrarse");

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      await fetchProfile(data.access_token);
      return { error: null };
    } catch (error) {
      console.error("Error en signUp:", error);
      return { error: error as Error };
    }
  }

  // 🚪 Cerrar sesión
  function signOut() {
    setUser(null);
    localStorage.removeItem("token");
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
