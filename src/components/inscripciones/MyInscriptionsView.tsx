import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, CheckCircle, XCircle, Clock, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { inscripcionService, participacionService } from '../../services/api';
import { ActivityDetailModal } from '../activities/ActivityDetailModal';
import { ConfirmAsistenciaModal } from '../participacion/ConfirmAsistenciaModal';

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
  const [activityForAsistencia, setActivityForAsistencia] = useState<any>(null);
  const [isAsistenciaModalOpen, setIsAsistenciaModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [participaciones, setParticipaciones] = useState<any[]>([]);

  useEffect(() => {
    loadInscripciones();
    loadParticipaciones();
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

  async function loadParticipaciones() {
    try {
      const data = await participacionService.getMyParticipaciones();
      setParticipaciones(data);
    } catch (error) {
      console.error('Error loading participaciones:', error);
      setParticipaciones([]);
    }
  }

  function hasParticipacion(actividadId: number): boolean {
    return participaciones.some((p: any) => p.actividadId === actividadId);
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

  function handleConfirmAsistencia(e: React.MouseEvent, activity: any) {
    e.stopPropagation(); // Evitar que abra el modal de detalles
    setActivityForAsistencia(activity);
    setIsAsistenciaModalOpen(true);
  }

  function isActivityPast(activity: any): boolean {
    const activityDate = new Date(activity.fecha);
    const activityTime = new Date(activity.hora);
    // Combinar fecha y hora
    const activityDateTime = new Date(
      activityDate.getFullYear(),
      activityDate.getMonth(),
      activityDate.getDate(),
      activityTime.getHours(),
      activityTime.getMinutes()
    );
    const now = new Date();
    // Considerar que la actividad ya pasó si ya pasó la fecha/hora
    return activityDateTime <= now;
  }

  function onShowToast(message: string, type: 'success' | 'error') {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  function handleAsistenciaSuccess() {
    loadInscripciones(); // Recargar inscripciones
    loadParticipaciones(); // Recargar participaciones para ocultar el botón
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

                {/* Botones */}
                <div className="mt-4 space-y-2">
                  {isActivityPast(inscripcion.actividad) && 
                   inscripcion.estado === 'confirmada' && 
                   !hasParticipacion(inscripcion.actividad.id) && (
                    <button
                      onClick={(e) => handleConfirmAsistencia(e, inscripcion.actividad)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      Confirmar Asistencia
                    </button>
                  )}
                  {hasParticipacion(inscripcion.actividad.id) && (
                    <div className="w-full px-4 py-2 bg-green-100 border-2 border-green-300 text-green-800 rounded-lg font-semibold flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Asistencia Confirmada
                    </div>
                  )}
                  <button
                    onClick={() => handleViewActivity(inscripcion.actividad)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition"
                  >
                    Ver Detalles
                  </button>
                </div>
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

      {/* Modal de confirmar asistencia */}
      {activityForAsistencia && (
        <ConfirmAsistenciaModal
          activity={activityForAsistencia}
          isOpen={isAsistenciaModalOpen}
          onClose={() => {
            setIsAsistenciaModalOpen(false);
            setActivityForAsistencia(null);
          }}
          onSuccess={handleAsistenciaSuccess}
          onShowToast={onShowToast}
        />
      )}

      {/* Toast */}
      {showToast && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          {toastMessage}
        </div>
      )}
    </>
  );
}

