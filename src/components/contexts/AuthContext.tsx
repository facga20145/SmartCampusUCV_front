import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

const API_URL = import.meta.env.VITE_API_URL + "/auth";

type User = {
  id: number;
  nombre: string;
  apellido: string;
  correoInstitucional: string;
  rol: string;
  intereses?: string;
  hobbies?: string;
  foto?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (correoInstitucional: string, contrasena: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      const res = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al cargar perfil");
      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error(error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }

  async function signIn(correoInstitucional: string, contrasena: string) {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correoInstitucional, contrasena }),
      });
      if (!res.ok) throw new Error("Credenciales incorrectas");
      const data = await res.json();
      localStorage.setItem("token", data.accessToken);
      setUser(data.user);
      return { error: null };
    } catch (error) {
      console.error("Error en signIn:", error);
      return { error: error as Error };
    }
  }

  function signOut() {
    setUser(null);
    localStorage.removeItem("token");
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
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
