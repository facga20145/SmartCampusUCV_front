import { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, Leaf, Edit, Trash2, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../contexts/AuthContext';
import { inscripcionService, actividadService } from '../../services/api';

type Activity = {
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

type Inscripcion = {
  id: number;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    correoInstitucional: string;
  };
  estado: string;
};

type ActivityDetailModalProps = {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
};

export function ActivityDetailModal({ activity, isOpen, onClose, onUpdate }: ActivityDetailModalProps) {
  const { user } = useAuth();
  const role = useRole();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [participantes, setParticipantes] = useState<Inscripcion[]>([]);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    categoriaCustom: '',
    fecha: '',
    hora: '',
    lugar: '',
    maxParticipantes: '',
    nivelSostenibilidad: '',
  });
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  useEffect(() => {
    if (isOpen && activity) {
      // Inicializar formulario de edición con datos de la actividad
      if (!isEditing) {
        const date = new Date(activity.fecha);
        const hora = new Date(activity.hora);
        setEditFormData({
          titulo: activity.titulo,
          descripcion: activity.descripcion || '',
          categoria: activity.categoria,
          categoriaCustom: '',
          fecha: date.toISOString().split('T')[0],
          hora: hora.toTimeString().slice(0, 5), // HH:MM
          lugar: activity.lugar,
          maxParticipantes: '',
          nivelSostenibilidad: '',
        });
      }

      if (role === 'administrador' || (role === 'organizador' && user?.id === activity.organizadorId)) {
        loadParticipantes();
      } else if (role === 'estudiante') {
        checkSubscription();
      }
    }
  }, [isOpen, activity, isEditing]);

  async function checkSubscription() {
    try {
      const inscripciones = await inscripcionService.getMyInscripciones();
      const inscripcion = inscripciones.find((ins: any) => ins.actividadId === activity?.id);
      setIsSubscribed(!!inscripcion);
      setSubscriptionId(inscripcion?.id || null);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }

  async function loadParticipantes() {
    setLoadingParticipantes(true);
    try {
      // TODO: Implementar endpoint para obtener participantes de una actividad
      // Por ahora, obtenemos todas las inscripciones del usuario
      const response = await fetch(
        `https://smartcampusucv.onrender.com/inscripciones/actividad/${activity?.id}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setParticipantes(data);
      }
    } catch (error) {
      console.error('Error loading participantes:', error);
    } finally {
      setLoadingParticipantes(false);
    }
  }

  async function handleInscription() {
    if (!activity || !user) return;

    setLoading(true);
    try {
      await inscripcionService.create(activity.id);
      setIsSubscribed(true);
      onShowToast('Te has inscrito exitosamente', 'success');
      onUpdate();
    } catch (error) {
      onShowToast('Error al inscribirse', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleUnsubscribe() {
    if (!subscriptionId) return;

    setLoading(true);
    try {
      await inscripcionService.update(subscriptionId, 'cancelada');
      setIsSubscribed(false);
      setSubscriptionId(null);
      onShowToast('Te has desinscrito exitosamente', 'success');
      onUpdate();
    } catch (error) {
      onShowToast('Error al desinscribirse', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmParticipant(inscripcionId: number) {
    try {
      await inscripcionService.update(inscripcionId, 'confirmada');
      onShowToast('Inscripción confirmada exitosamente', 'success');
      loadParticipantes(); // Recargar lista de participantes
    } catch (error) {
      onShowToast('Error al confirmar inscripción', 'error');
    }
  }

  async function handleCancelParticipant(inscripcionId: number) {
    try {
      await inscripcionService.update(inscripcionId, 'cancelada');
      onShowToast('Inscripción cancelada exitosamente', 'success');
      loadParticipantes(); // Recargar lista de participantes
    } catch (error) {
      onShowToast('Error al cancelar inscripción', 'error');
    }
  }

  async function handleUpdate() {
    if (!activity) return;

    const error = validateEditForm();
    if (error) {
      onShowToast(error, 'error');
      return;
    }

    setLoading(true);
    try {
      const categoriaFinal = editFormData.categoria === 'otra' ? editFormData.categoriaCustom : editFormData.categoria;
      const fechaISO = new Date(`${editFormData.fecha}T${editFormData.hora}:00.000Z`).toISOString();

      await actividadService.update(activity.id, {
        titulo: editFormData.titulo,
        descripcion: editFormData.descripcion,
        categoria: categoriaFinal,
        fecha: editFormData.fecha,
        hora: fechaISO,
        lugar: editFormData.lugar,
        maxParticipantes: editFormData.maxParticipantes ? parseInt(editFormData.maxParticipantes) : undefined,
        nivelSostenibilidad: editFormData.nivelSostenibilidad ? parseInt(editFormData.nivelSostenibilidad) : undefined,
      });

      onShowToast('Actividad actualizada exitosamente', 'success');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      onShowToast('Error al actualizar la actividad', 'error');
    } finally {
      setLoading(false);
    }
  }

  function validateEditForm() {
    if (!editFormData.titulo || editFormData.titulo.length < 3) return 'Título inválido';
    if (!editFormData.descripcion || editFormData.descripcion.length < 10) return 'Descripción inválida';
    if (!editFormData.categoria && !showCustomCategory) return 'Selecciona una categoría';
    if (showCustomCategory && !editFormData.categoriaCustom) return 'Escribe tu categoría personalizada';
    if (!editFormData.fecha) return 'Selecciona una fecha';
    if (!editFormData.hora) return 'Selecciona una hora';
    if (!editFormData.lugar || editFormData.lugar.length < 3) return 'Lugar inválido';
    return null;
  }

  async function handleDelete() {
    if (!activity) return;
    if (!confirm('¿Estás seguro de que deseas eliminar esta actividad?')) return;

    setLoading(true);
    try {
      await actividadService.delete(activity.id);
      onShowToast('Actividad eliminada exitosamente', 'success');
      onUpdate();
      onClose();
    } catch (error) {
      onShowToast('Error al eliminar la actividad', 'error');
    } finally {
      setLoading(false);
    }
  }

  const onShowToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (!isOpen || !activity) return null;

  const date = new Date(activity.fecha);
  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);

  const canEdit = role === 'administrador' || (role === 'organizador' && user?.id === activity.organizadorId);
  const canSubscribe = role === 'estudiante';

  return (
    <>
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-medium`}>
          {toastMessage}
        </div>
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">Detalles de la Actividad</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {!isEditing ? (
              <>
                {/* Título y categoría */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {activity.categoria}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-3">{activity.titulo}</h3>
                  <p className="text-slate-600">{activity.descripcion}</p>
                </div>

                {/* Información */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold">{formattedDate}</p>
                      <p className="text-sm">{activity.hora}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">{activity.lugar}</p>
                    </div>
                  </div>
                  {activity.organizador && (
                    <div className="flex items-center gap-3 text-slate-700">
                      <Users className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-semibold">Organizador</p>
                        <p className="text-sm">{activity.organizador.nombre} {activity.organizador.apellido}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-slate-700">
                    <Leaf className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold">Categoría</p>
                      <p className="text-sm">{activity.categoria}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Formulario de edición */
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Editar Actividad</h3>
                <div className="space-y-4">
                  {/* Título */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Título *</label>
                    <input
                      type="text"
                      value={editFormData.titulo}
                      onChange={(e) => setEditFormData({ ...editFormData, titulo: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Título de la actividad"
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Descripción *</label>
                    <textarea
                      value={editFormData.descripcion}
                      onChange={(e) => setEditFormData({ ...editFormData, descripcion: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Descripción de la actividad"
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Categoría *</label>
                    <select
                      value={editFormData.categoria}
                      onChange={(e) => {
                        setEditFormData({ ...editFormData, categoria: e.target.value });
                        setShowCustomCategory(e.target.value === 'otra');
                      }}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecciona una categoría</option>
                      <option value="deportiva">🏃 Deportiva</option>
                      <option value="artistica">🎨 Artística</option>
                      <option value="voluntariado">🤝 Voluntariado</option>
                      <option value="canto">🎤 Canto</option>
                      <option value="ambiental">🌱 Ambiental</option>
                      <option value="tecnologica">💻 Tecnológica</option>
                      <option value="cultural">🎭 Cultural</option>
                      <option value="academica">📚 Académica</option>
                      <option value="social">👥 Social</option>
                      <option value="otra">✏️ Otra</option>
                    </select>
                    {showCustomCategory && (
                      <input
                        type="text"
                        value={editFormData.categoriaCustom}
                        onChange={(e) => setEditFormData({ ...editFormData, categoriaCustom: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-2"
                        placeholder="Escribe tu categoría personalizada"
                      />
                    )}
                  </div>

                  {/* Fecha y Hora */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Fecha *</label>
                      <input
                        type="date"
                        value={editFormData.fecha}
                        onChange={(e) => setEditFormData({ ...editFormData, fecha: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Hora *</label>
                      <input
                        type="time"
                        value={editFormData.hora}
                        onChange={(e) => setEditFormData({ ...editFormData, hora: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Lugar */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Lugar *</label>
                    <input
                      type="text"
                      value={editFormData.lugar}
                      onChange={(e) => setEditFormData({ ...editFormData, lugar: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ubicación de la actividad"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Participantes (solo para organizadores y administradores) */}
            {canEdit && (
              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Participantes ({participantes.length})
                </h4>
                {loadingParticipantes ? (
                  <p className="text-slate-600">Cargando participantes...</p>
                ) : participantes.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {participantes.map((participante) => (
                      participante.usuario ? (
                        <div key={participante.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">
                              {participante.usuario.nombre} {participante.usuario.apellido}
                            </p>
                            <p className="text-xs text-slate-600">{participante.usuario.correoInstitucional}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              participante.estado === 'confirmada' ? 'bg-green-100 text-green-800' : 
                              participante.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {participante.estado}
                            </span>
                            {participante.estado === 'pendiente' && (
                              <button
                                onClick={() => handleConfirmParticipant(participante.id)}
                                className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-medium"
                                title="Confirmar inscripción"
                              >
                                Confirmar
                              </button>
                            )}
                            {participante.estado === 'confirmada' && (
                              <button
                                onClick={() => handleCancelParticipant(participante.id)}
                                className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium"
                                title="Cancelar inscripción"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </div>
                      ) : null
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600">No hay participantes inscritos aún</p>
                )}
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              {canSubscribe && (
                <button
                  onClick={isSubscribed ? handleUnsubscribe : handleInscription}
                  disabled={loading}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                    isSubscribed
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gradient-to-r from-green-500 to-blue-600 hover:opacity-90 text-white'
                  } disabled:opacity-50`}
                >
                  {loading ? 'Cargando...' : isSubscribed ? 'Desinscribirse' : 'Inscribirse'}
                </button>
              )}
              {canEdit && (
                <>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-3 border-2 border-blue-500 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                  ) : (
                    <button
                      onClick={handleUpdate}
                      disabled={loading}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      Guardar
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-6 py-3 border-2 border-red-500 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

