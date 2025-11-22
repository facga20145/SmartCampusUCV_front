import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, Users, Leaf, Save, X } from 'lucide-react';

export function CreateActivityView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    categoriaCustom: '',
    fecha: '',
    hora: '',
    lugar: '',
    maxParticipantes: '',
    nivelSostenibilidad: '5',
  });

  const onShowToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const validateForm = () => {
    if (!formData.titulo || formData.titulo.length < 3) return 'Título inválido';
    if (!formData.descripcion || formData.descripcion.length < 10) return 'Descripción inválida';
    if (!formData.categoria) return 'Selecciona una categoría';
    if (!formData.fecha) return 'Selecciona una fecha';
    if (new Date(formData.fecha) < new Date()) return 'La fecha no puede ser pasada';
    if (!formData.hora) return 'Selecciona una hora';
    if (!formData.lugar || formData.lugar.length < 3) return 'Lugar inválido';
    return null;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      onShowToast(error, 'error');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado');
      const API_URL = import.meta.env.VITE_API_URL || 'https://smartcampusucv.onrender.com';
      if (!user || !user.id) throw new Error('Usuario no encontrado');
      
      // Usar categoría personalizada si se seleccionó "otra"
      const categoriaFinal = formData.categoria === 'otra' ? formData.categoriaCustom : formData.categoria;
      
      // Combinar fecha y hora en formato ISO
      const fechaISO = new Date(`${formData.fecha}T${formData.hora}:00.000Z`).toISOString();
      
      await fetch(`${API_URL}/actividades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          categoria: categoriaFinal,
          fecha: formData.fecha,
          hora: fechaISO,
          lugar: formData.lugar,
          maxParticipantes: formData.maxParticipantes ? parseInt(formData.maxParticipantes) : undefined,
          nivelSostenibilidad: formData.nivelSostenibilidad ? parseInt(formData.nivelSostenibilidad) : undefined,
          organizadorId: user.id,
        }),
      });
      
      onShowToast('Actividad creada exitosamente', 'success');
      
      // Limpiar formulario
      setFormData({
        titulo: '', descripcion: '', categoria: '', categoriaCustom: '',
        fecha: '', hora: '', lugar: '',
        maxParticipantes: '', nivelSostenibilidad: '5',
      });
      setShowCustomCategory(false);
      
      // Redirigir a home después de 2 segundos
      setTimeout(() => {
        // Intentar navegar sin recargar usando window.history
        window.location.hash = '';
        window.location.href = '/home';
      }, 2000);
    } catch (error) {
      onShowToast('Error al crear la actividad', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-6">
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-medium`}>
          {toastMessage}
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Crear Nueva Actividad</h2>
        <p className="text-slate-600 mt-1">Completa el formulario para publicar una actividad sostenible</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 md:p-8 max-w-3xl">
        <h3 className="text-xl font-bold mb-6 text-slate-900">Detalles de la Actividad</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-slate-700 mb-2">
              Título de la Actividad *
            </label>
            <input
              id="titulo"
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-base font-medium"
              placeholder="Ej: Taller de Reciclaje Creativo"
              required
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700 mb-2">
              Descripción *
            </label>
            <textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border-2 border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-base font-medium"
              placeholder="Describe los detalles, objetivos y beneficios de la actividad..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-slate-700 mb-2">
                Categoría *
              </label>
              <select
                id="categoria"
                value={formData.categoria}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, categoria: value });
                  setShowCustomCategory(value === 'otra');
                }}
                className="w-full px-4 py-3 border-2 border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-base font-medium"
                required
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
                  value={formData.categoriaCustom}
                  onChange={(e) => setFormData({ ...formData, categoriaCustom: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-base font-medium mt-2"
                  placeholder="Escribe tu categoría personalizada"
                />
              )}
            </div>

            <div>
              <label htmlFor="lugar" className="block text-sm font-medium text-slate-700 mb-2">
                <MapPin className="inline w-5 h-5 text-blue-600 mr-1" />
                Ubicación *
              </label>
              <input
                id="lugar"
                type="text"
                value={formData.lugar}
                onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-base font-medium"
                placeholder="Ej: Auditorio principal"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="inline w-5 h-5 text-blue-600 mr-1" />
                Fecha *
              </label>
              <input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-base font-medium"
                required
              />
            </div>

            <div>
              <label htmlFor="hora" className="block text-sm font-medium text-slate-700 mb-2">
                Hora *
              </label>
              <input
                id="hora"
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-base font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="maxParticipantes" className="block text-sm font-medium text-slate-700 mb-2">
                <Users className="inline w-5 h-5 text-blue-600 mr-1" />
                Máximo de Participantes
              </label>
              <input
                id="maxParticipantes"
                type="number"
                min="1"
                value={formData.maxParticipantes}
                onChange={(e) => setFormData({ ...formData, maxParticipantes: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-base font-medium"
                placeholder="25"
              />
            </div>

            <div>
              <label htmlFor="nivelSostenibilidad" className="block text-sm font-medium text-slate-700 mb-2">
                <Leaf className="inline w-5 h-5 text-green-600 mr-1" />
                Nivel de Sostenibilidad: {formData.nivelSostenibilidad}
              </label>
              <input
                id="nivelSostenibilidad"
                type="range"
                min="1"
                max="10"
                value={formData.nivelSostenibilidad}
                onChange={(e) => setFormData({ ...formData, nivelSostenibilidad: e.target.value })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>🌱 Básico</span>
                <span>🌿 Intermedio</span>
                <span>🌳 Avanzado</span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="pt-2 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 font-medium transition"
            >
              <X className="inline w-5 h-5 mr-2" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium hover:opacity-90 transition shadow-md disabled:opacity-50"
            >
              <Save className="inline w-5 h-5 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Actividad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

