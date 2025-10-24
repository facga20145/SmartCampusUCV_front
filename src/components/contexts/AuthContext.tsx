import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authService } from "../../services/api";

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
  signUp: (correoInstitucional: string, contrasena: string, nombre: string, apellido: string) => Promise<{ error: Error | null }>;
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

  async function fetchProfile(_token: string) {
    try {
      const userData = await authService.getProfile();
      // Asumiendo que la API devuelve directamente los datos del usuario
      setUser(userData);
    } catch (error) {
      console.error(error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }

  async function signIn(correoInstitucional: string, contrasena: string) {
    try {
      const data = await authService.login(correoInstitucional, contrasena);
      localStorage.setItem("token", data.accessToken);
      setUser(data.user);
      return { error: null };
    } catch (error) {
      console.error("Error en signIn:", error);
      return { error: error as Error };
    }
  }
  
  async function signUp(correoInstitucional: string, contrasena: string, nombre: string, apellido: string) {
    try {
      const data = await authService.register({
        correoInstitucional,
        contrasena,
        nombre,
        apellido,
        rol: "estudiante"
      });
      localStorage.setItem("token", data.accessToken);
      setUser(data.user);
      return { error: null };
    } catch (error) {
      console.error("Error en signUp:", error);
      return { error: error as Error };
    }
  }

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
