import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { inscripcionService } from '../../services/api';
import { ActivityDetailModal } from '../activities/ActivityDetailModal';

type Inscripcion = {
  id: number;
  actividad: {
    id: number;
    titulo: string;
    descripcion: string;
    categoria: string;
    fecha: string;
    hora: string;
    lugar: string;
    organizadorId: number;
    organizador?: {
      nombre: string;
      apellido: string;
    };
  };
  estado: 'pendiente' | 'confirmada' | 'cancelada';
};

export function MyInscriptionsView() {
  const { user } = useAuth();
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadInscripciones();
  }, []);

  async function loadInscripciones() {
    setLoading(true);
    try {
      const data = await inscripcionService.getMyInscripciones();
      setInscripciones(data);
    } catch (error) {
      console.error('Error loading inscripciones:', error);
      setInscripciones([]);
    } finally {
      setLoading(false);
    }
  }

  function getEstadoIcon(estado: string) {
    switch (estado) {
      case 'confirmada':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelada':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pendiente':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  }

  function getEstadoLabel(estado: string) {
    switch (estado) {
      case 'confirmada':
        return 'Confirmada';
      case 'cancelada':
        return 'Cancelada';
      case 'pendiente':
        return 'Pendiente';
      default:
        return estado;
    }
  }

  function getEstadoColor(estado: string) {
    switch (estado) {
      case 'confirmada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function handleViewActivity(activity: any) {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-600">Cargando tus inscripciones...</p>
      </div>
    );
  }

  if (inscripciones.length === 0) {
    return (
      <div className="text-center py-10">
        <Calendar className="w-16 h-16 mx-auto text-slate-400 mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">No tienes inscripciones</h3>
        <p className="text-slate-600">Inscríbete en actividades para verlas aquí</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Mis Inscripciones</h2>
        <p className="text-slate-600">Actividades en las que estás inscrito</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inscripciones.map((inscripcion) => {
          const date = new Date(inscripcion.actividad.fecha);
          const formattedDate = new Intl.DateTimeFormat('es-ES', {
            day: 'numeric',
            month: 'short',
          }).format(date);

          return (
            <div
              key={inscripcion.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewActivity(inscripcion.actividad)}
            >
              <div className="p-5">
                {/* Estado y fecha */}
                <div className="flex justify-between items-start mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {inscripcion.actividad.categoria}
                  </span>
                  <div className="flex items-center gap-2">
                    {getEstadoIcon(inscripcion.estado)}
                    <span className={`px-2 py-1 text-xs rounded-full ${getEstadoColor(inscripcion.estado)}`}>
                      {getEstadoLabel(inscripcion.estado)}
                    </span>
                  </div>
                </div>

                {/* Título */}
                <h3 className="text-lg font-bold text-slate-900 mb-2">{inscripcion.actividad.titulo}</h3>
                <p className="text-slate-600 text-sm line-clamp-2 mb-4">{inscripcion.actividad.descripcion}</p>

                {/* Información */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>{inscripcion.actividad.lugar}</span>
                  </div>
                  {inscripcion.actividad.organizador && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="w-4 h-4" />
                      <span>{inscripcion.actividad.organizador.nombre} {inscripcion.actividad.organizador.apellido}</span>
                    </div>
                  )}
                </div>

                {/* Botón ver detalles */}
                <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition">
                  Ver Detalles
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de detalles */}
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={loadInscripciones}
      />
    </>
  );
}

