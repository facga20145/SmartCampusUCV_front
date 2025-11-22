import { useState, useEffect } from 'react';
import { Award, Plus, Search, User, X, CheckCircle } from 'lucide-react';
import { reconocimientoService, authService } from '../../services/api';

type Reconocimiento = {
  id: number;
  usuarioId: number;
  tipo: string | null;
  descripcion: string | null;
  fecha: string;
  usuario?: {
    id: number;
    nombre: string;
    apellido: string;
    correoInstitucional: string;
  };
};

type Usuario = {
  id: number;
  nombre: string;
  apellido: string;
  correoInstitucional: string;
};

export function ManageReconocimientosView() {
  const [reconocimientos, setReconocimientos] = useState<Reconocimiento[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [tipoBadge, setTipoBadge] = useState('badge');
  const [descripcionBadge, setDescripcionBadge] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    loadReconocimientos();
    loadUsuarios();
  }, []);

  async function loadReconocimientos() {
    try {
      setLoading(true);
      const data = await reconocimientoService.getAll();
      setReconocimientos(data);
    } catch (error) {
      console.error('Error loading reconocimientos:', error);
      onShowToast('Error al cargar reconocimientos', 'error');
      setReconocimientos([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsuarios() {
    try {
      const data = await authService.getAllUsuarios();
      setUsuarios(data);
    } catch (error) {
      console.error('Error loading usuarios:', error);
      setUsuarios([]);
    }
  }

  function onShowToast(message: string, type: 'success' | 'error') {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  async function handleCreateReconocimiento(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUsuario) {
      onShowToast('Debes seleccionar un usuario', 'error');
      return;
    }

    try {
      await reconocimientoService.create({
        usuarioId: selectedUsuario.id,
        tipo: tipoBadge || null,
        descripcion: descripcionBadge || null,
      });
      onShowToast('Reconocimiento creado exitosamente', 'success');
      setShowCreateModal(false);
      setSelectedUsuario(null);
      setTipoBadge('badge');
      setDescripcionBadge('');
      loadReconocimientos();
    } catch (error) {
      console.error('Error creating reconocimiento:', error);
      onShowToast('Error al crear reconocimiento', 'error');
    }
  }

  function getBadgeColor(tipo: string | null) {
    switch (tipo?.toLowerCase()) {
      case 'badge':
      case 'medalla':
        return 'bg-gradient-to-br from-yellow-400 to-orange-500';
      case 'diploma':
      case 'certificado':
        return 'bg-gradient-to-br from-blue-400 to-purple-500';
      default:
        return 'bg-gradient-to-br from-green-400 to-blue-500';
    }
  }

  const filteredReconocimientos = reconocimientos.filter((rec) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      rec.usuario?.nombre.toLowerCase().includes(query) ||
      rec.usuario?.apellido.toLowerCase().includes(query) ||
      rec.usuario?.correoInstitucional.toLowerCase().includes(query) ||
      rec.tipo?.toLowerCase().includes(query) ||
      rec.descripcion?.toLowerCase().includes(query)
    );
  });

  const filteredUsuarios = usuarios.filter((usuario) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      usuario.nombre.toLowerCase().includes(query) ||
      usuario.apellido.toLowerCase().includes(query) ||
      usuario.correoInstitucional.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-slate-600">Cargando reconocimientos...</p>
      </div>
    );
  }

  return (
    <>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Award className="w-7 h-7 text-yellow-500" />
              Gestión de Reconocimientos
            </h2>
            <p className="text-slate-600 mt-1">Asigna badges personalizados a los usuarios</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2 shadow-md"
          >
            <Plus className="w-5 h-5" />
            Crear Badge
          </button>
        </div>

        {/* Buscador */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, email, tipo o descripción..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Lista de reconocimientos */}
        {filteredReconocimientos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No hay reconocimientos registrados aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReconocimientos.map((reconocimiento) => (
              <div
                key={reconocimiento.id}
                className={`${getBadgeColor(reconocimiento.tipo)} rounded-xl p-5 text-white shadow-md`}
              >
                <div className="flex items-start justify-between mb-3">
                  <Award className="w-6 h-6" />
                  <span className="text-xs opacity-75">
                    {new Date(reconocimiento.fecha).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">
                  {reconocimiento.tipo || 'Reconocimiento'}
                </h3>
                {reconocimiento.descripcion && (
                  <p className="text-sm opacity-90 mb-4">{reconocimiento.descripcion}</p>
                )}
                {reconocimiento.usuario && (
                  <div className="flex items-center gap-2 pt-3 border-t border-white/20">
                    <User className="w-4 h-4" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {reconocimiento.usuario.nombre} {reconocimiento.usuario.apellido}
                      </p>
                      <p className="text-xs opacity-75">{reconocimiento.usuario.correoInstitucional}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de creación */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setSelectedUsuario(null);
                setTipoBadge('badge');
                setDescripcionBadge('');
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Crear Badge Personalizado</h2>

            <form onSubmit={handleCreateReconocimiento} className="space-y-4">
              {/* Buscar usuario */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Seleccionar Usuario
                </label>
                {!selectedUsuario ? (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar usuario..."
                      className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {searchQuery && filteredUsuarios.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredUsuarios.map((usuario) => (
                          <button
                            key={usuario.id}
                            type="button"
                            onClick={() => {
                              setSelectedUsuario(usuario);
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {usuario.nombre} {usuario.apellido}
                              </p>
                              <p className="text-xs text-slate-500">{usuario.correoInstitucional}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {selectedUsuario.nombre} {selectedUsuario.apellido}
                        </p>
                        <p className="text-xs text-slate-600">{selectedUsuario.correoInstitucional}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedUsuario(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Tipo de badge */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Badge</label>
                <select
                  value={tipoBadge}
                  onChange={(e) => setTipoBadge(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="badge">Badge / Medalla</option>
                  <option value="diploma">Diploma / Certificado</option>
                  <option value="reconocimiento">Reconocimiento General</option>
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={descripcionBadge}
                  onChange={(e) => setDescripcionBadge(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Por alcanzar 100 puntos, Por participar en 10 actividades..."
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedUsuario(null);
                    setTipoBadge('badge');
                    setDescripcionBadge('');
                  }}
                  className="px-5 py-2 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium hover:opacity-90 transition flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Crear Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div
          className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
            toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toastType === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          <p className="font-medium">{toastMessage}</p>
        </div>
      )}
    </>
  );
}

