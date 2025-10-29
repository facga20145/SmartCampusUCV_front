// Configuración base para las llamadas a la API
const API_URL = import.meta.env.VITE_API_URL || 'https://smartcampusucv.onrender.com';

// Función auxiliar para manejar las respuestas de fetch
async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let message = errorData.message || 'Error en la solicitud';

    // Mapeo específico por código de estado
    if (response.status === 409) {
      message = 'Cuenta ya existente. Por favor, usa otro correo o inicia sesión.';
    }

    throw new Error(message);
  }
  return response.json();
}

// Función para obtener el token de autenticación
function getAuthHeader() {
  const token = sessionStorage.getItem('token');
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
  },

  // Obtener todos los usuarios (admin)
  async getAllUsuarios() {
    const response = await fetch(`${API_URL}/usuarios`, {
      headers: {
        ...getAuthHeader(),
      } as HeadersInit,
    });
    return handleResponse(response);
  },
};

// Servicios de actividades
export const actividadService = {
  // Obtener todas las actividades
  async getAll(filters?: {
    categoria?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    lugar?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.categoria) params.append('categoria', filters.categoria);
    if (filters?.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
    if (filters?.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
    if (filters?.lugar) params.append('lugar', filters.lugar);

    const response = await fetch(`${API_URL}/actividades?${params.toString()}`);
    return handleResponse(response);
  },

  // Obtener actividad por ID
  async getById(id: number) {
    const response = await fetch(`${API_URL}/actividades/${id}`);
    return handleResponse(response);
  },

  // Crear actividad (solo organizadores)
  async create(actividadData: {
    titulo: string;
    descripcion: string;
    categoria: string;
    fecha: string;
    hora: string;
    lugar: string;
    maxParticipantes?: number;
    nivelSostenibilidad?: number;
    organizadorId: number;
  }) {
    const response = await fetch(`${API_URL}/actividades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      } as HeadersInit,
      body: JSON.stringify(actividadData),
    });
    return handleResponse(response);
  },

  // Actualizar actividad
  async update(id: number, actividadData: any) {
    const response = await fetch(`${API_URL}/actividades/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      } as HeadersInit,
      body: JSON.stringify(actividadData),
    });
    return handleResponse(response);
  },

  // Eliminar actividad
  async delete(id: number) {
    const response = await fetch(`${API_URL}/actividades/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      } as HeadersInit,
    });
    return handleResponse(response);
  },
};

// Servicios de inscripciones
export const inscripcionService = {
  // Inscribirse en una actividad
  async create(actividadId: number) {
    const response = await fetch(`${API_URL}/inscripciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      } as HeadersInit,
      body: JSON.stringify({ actividadId }),
    });
    return handleResponse(response);
  },

  // Obtener mis inscripciones
  async getMyInscripciones() {
    const response = await fetch(`${API_URL}/inscripciones`, {
      headers: {
        ...getAuthHeader(),
      } as HeadersInit,
    });
    return handleResponse(response);
  },

  // Actualizar estado de inscripción
  async update(id: number, estado: string) {
    const response = await fetch(`${API_URL}/inscripciones/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      } as HeadersInit,
      body: JSON.stringify({ estado }),
    });
    return handleResponse(response);
  },
};

// Servicios de participación
export const participacionService = {
  // Crear participación (marcar asistencia)
  async create(actividadId: number, asistencia: boolean, feedback?: string, puntos?: number) {
    const response = await fetch(`${API_URL}/participaciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      } as HeadersInit,
      body: JSON.stringify({
        actividadId,
        asistencia,
        feedback: feedback || null,
        puntos: puntos || 0,
      }),
    });
    return handleResponse(response);
  },

  // Actualizar participación (actualizar asistencia/feedback)
  async update(id: number, asistencia?: boolean, feedback?: string, puntos?: number) {
    const response = await fetch(`${API_URL}/participaciones/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      } as HeadersInit,
      body: JSON.stringify({
        asistencia,
        feedback,
        puntos,
      }),
    });
    return handleResponse(response);
  },

  // Obtener ranking global
  async getRankingGlobal(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    const response = await fetch(`${API_URL}/participaciones/ranking-global${params}`, {
      headers: {
        ...getAuthHeader(),
      } as HeadersInit,
    });
    return handleResponse(response);
  },

  // Obtener ranking por actividad
  async getRankingActividad(actividadId: number, limit?: number) {
    const params = new URLSearchParams();
    params.append('actividadId', actividadId.toString());
    if (limit) params.append('limit', limit.toString());
    
    const response = await fetch(`${API_URL}/participaciones/ranking?${params.toString()}`, {
      headers: {
        ...getAuthHeader(),
      } as HeadersInit,
    });
    return handleResponse(response);
  },

  // Obtener mis participaciones
  async getMyParticipaciones() {
    const response = await fetch(`${API_URL}/participaciones`, {
      headers: {
        ...getAuthHeader(),
      } as HeadersInit,
    });
    return handleResponse(response);
  },
};

// ==================== RECONOCIMIENTOS ====================
export const reconocimientoService = {
  // Obtener mis reconocimientos
  async getMyReconocimientos() {
    const response = await fetch(`${API_URL}/reconocimientos/mis-reconocimientos`, {
      headers: {
        ...getAuthHeader(),
      } as HeadersInit,
    });
    return handleResponse(response);
  },

  // Obtener reconocimientos de un usuario
  async getByUsuario(usuarioId: number) {
    const response = await fetch(`${API_URL}/reconocimientos/usuario/${usuarioId}`, {
      headers: {
        ...getAuthHeader(),
      } as HeadersInit,
    });
    return handleResponse(response);
  },

  // Obtener todos los reconocimientos (admin)
  async getAll() {
    const response = await fetch(`${API_URL}/reconocimientos`, {
      headers: {
        ...getAuthHeader(),
      } as HeadersInit,
    });
    return handleResponse(response);
  },

  // Crear reconocimiento (admin)
  async create(data: { usuarioId: number; tipo?: string; descripcion?: string }) {
    const response = await fetch(`${API_URL}/reconocimientos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      } as HeadersInit,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};