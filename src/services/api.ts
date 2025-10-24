// Configuración base para las llamadas a la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Función auxiliar para manejar las respuestas de fetch
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error en la solicitud');
  }
  return response.json();
}

// Función para obtener el token de autenticación
function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Servicios de autenticación
export const authService = {
  // Iniciar sesión
  async login(correoInstitucional: string, contrasena: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correoInstitucional, contrasena }),
    });
    return handleResponse(response);
  },

  // Registrar nuevo usuario (usa módulo de usuarios)
  async register(userData: {
    nombre: string;
    apellido: string;
    correoInstitucional: string;
    contrasena: string;
    rol?: 'administrador' | 'organizador' | 'estudiante';
    intereses?: string;
    hobbies?: string;
  }) {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      } as HeadersInit,
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Perfil del usuario autenticado
  async getProfile() {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      } as HeadersInit,
    });
    return handleResponse(response);
  }
};