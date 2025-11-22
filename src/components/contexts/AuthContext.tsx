import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authService } from "../../services/api";

type UserRole = 'administrador' | 'organizador' | 'estudiante';

type User = {
  id: number;
  nombre: string;
  apellido: string;
  correoInstitucional: string;
  rol: UserRole;
  intereses?: string;
  hobbies?: string;
  foto?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (correoInstitucional: string, contrasena: string) => Promise<{ error: Error | null }>;
  signUp: (
    correoInstitucional: string,
    contrasena: string,
    nombre: string,
    apellido: string,
    intereses?: string,
    hobbies?: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchProfile(_token: string) {
    try {
      const response = await authService.getProfile();
      // La API devuelve { user: {...} }
      setUser(response.user || response);
    } catch (error) {
      console.error(error);
      sessionStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }

  async function signIn(correoInstitucional: string, contrasena: string) {
    try {
      const data = await authService.login(correoInstitucional, contrasena);
      sessionStorage.setItem("token", data.accessToken || data.token);
      setUser(data.user);
      return { error: null };
    } catch (error) {
      console.error("Error en signIn:", error);
      return { error: error as Error };
    }
  }
  
  async function signUp(
    correoInstitucional: string,
    contrasena: string,
    nombre: string,
    apellido: string,
    intereses?: string,
    hobbies?: string
  ) {
    try {
      await authService.register({
        correoInstitucional,
        contrasena,
        nombre,
        apellido,
        rol: 'estudiante',
        intereses,
        hobbies,
      });
      // No guardamos token ni usuario en registro: el usuario iniciará sesión luego
      return { error: null };
    } catch (error) {
      console.error("Error en signUp:", error);
      return { error: error as Error };
    }
  }

  function signOut() {
    setUser(null);
    sessionStorage.removeItem("token");
  }

  async function refreshUser() {
    const token = sessionStorage.getItem("token");
    if (token) {
      await fetchProfile(token);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshUser }}>
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

// Helper hooks for role-based access
export function useRole() {
  const { user } = useAuth();
  return user?.rol || null;
}

export function useIsAdmin() {
  const role = useRole();
  return role === 'administrador';
}

export function useIsOrganizer() {
  const role = useRole();
  return role === 'organizador';
}

export function useIsStudent() {
  const role = useRole();
  return role === 'estudiante';
}
