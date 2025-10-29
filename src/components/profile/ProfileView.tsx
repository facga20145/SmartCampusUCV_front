import { useState, useEffect } from 'react';
import { Heart, Smile, Camera, Trophy, Award, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { participacionService, reconocimientoService } from '../../services/api';

export function ProfileView() {
  const { user, signOut, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [newHobby, setNewHobby] = useState('');
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [totalPuntos, setTotalPuntos] = useState<number | null>(null);
  const [reconocimientos, setReconocimientos] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setFirstName(user.nombre || '');
      setLastName(user.apellido || '');
      setAvatarUrl(user.foto || '');
      setInterests(user.intereses ? user.intereses.split(',').map(i => i.trim()) : []);
      setHobbies(user.hobbies ? user.hobbies.split(',').map(h => h.trim()) : []);
      loadTotalPuntos();
      loadReconocimientos();
    }
  }, [user]);

  async function loadTotalPuntos() {
    try {
      const ranking = await participacionService.getRankingGlobal(1000); // Obtener muchos para encontrar al usuario
      const userPoints = ranking.find((r: any) => r.usuario?.id === user?.id);
      setTotalPuntos(userPoints?.puntos || 0);
    } catch (error) {
      console.error('Error loading puntos:', error);
      setTotalPuntos(0);
    }
  }

  async function loadReconocimientos() {
    try {
      const data = await reconocimientoService.getMyReconocimientos();
      setReconocimientos(data);
    } catch (error) {
      console.error('Error loading reconocimientos:', error);
      setReconocimientos([]);
    }
  }

  function getBadgeIcon(tipo: string | null) {
    switch (tipo?.toLowerCase()) {
      case 'badge':
      case 'medalla':
        return <Award className="w-6 h-6" />;
      case 'diploma':
      case 'certificado':
        return <Star className="w-6 h-6" />;
      default:
        return <Trophy className="w-6 h-6" />;
    }
  }

  function getBadgeColor(tipo: string | null) {
    switch (tipo?.toLowerCase()) {
      case 'badge':
      case 'medalla':
        return 'from-yellow-400 to-orange-500';
      case 'diploma':
      case 'certificado':
        return 'from-blue-400 to-purple-500';
      default:
        return 'from-green-400 to-blue-500';
    }
  }

  const onShowToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onShowToast('La imagen debe ser menor a 2MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function addInterest() {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  }

  function removeInterest(interest: string) {
    setInterests(interests.filter((i) => i !== interest));
  }

  function addHobby() {
    if (newHobby.trim() && !hobbies.includes(newHobby.trim())) {
      setHobbies([...hobbies, newHobby.trim()]);
      setNewHobby('');
    }
  }

  function removeHobby(hobby: string) {
    setHobbies(hobbies.filter((h) => h !== hobby));
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
    const token = sessionStorage.getItem('token');
    if (!token) throw new Error('Token no encontrado');
    const API_URL = import.meta.env.VITE_API_URL || 'https://smartcampusucv.onrender.com';
    if (!user || !user.id) throw new Error('Usuario no encontrado');
    
    const res = await fetch(`${API_URL}/usuarios/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre: firstName,
        apellido: lastName,
        intereses: interests.join(', '),
        hobbies: hobbies.join(', '),
        foto: avatarUrl,
      }),
    });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Error al actualizar el perfil');
      }
      onShowToast('Perfil actualizado con éxito', 'success');
      // Refrescar datos del usuario en el contexto
      await refreshUser();
    } catch (error) {
      onShowToast('Error al actualizar el perfil', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return <div className="text-center py-10">Cargando perfil...</div>;
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
      
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Mi Perfil</h1>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Columna izquierda - Foto de perfil */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
            <div className="relative mb-4">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={`Foto de perfil de ${user?.nombre || 'Usuario'}`} 
                  className="w-32 h-32 rounded-full border-4 border-slate-200 object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-slate-200 bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                  {user?.nombre?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition shadow-sm">
                <Camera className="w-5 h-5" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              {user?.nombre && user?.apellido ? `${user.nombre} ${user.apellido}` : 'Usuario'}
            </h2>
            <p className="text-slate-500">{user?.correoInstitucional}</p>
            <p className="mt-2 text-sm text-slate-600">{user?.rol}</p>
            {/* Puntos acumulados */}
            <div className="mt-4 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-xs text-slate-600">Puntos totales</p>
                  <p className="text-xl font-bold text-slate-900">
                    {totalPuntos !== null ? totalPuntos : '...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Badges/Reconocimientos */}
            {reconocimientos.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Mis Reconocimientos
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {reconocimientos.map((reconocimiento) => (
                    <div
                      key={reconocimiento.id}
                      className={`p-4 bg-gradient-to-br ${getBadgeColor(reconocimiento.tipo)} rounded-xl text-white shadow-md transform hover:scale-105 transition-transform`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-2">
                          {getBadgeIcon(reconocimiento.tipo)}
                        </div>
                        <p className="text-xs font-medium mb-1">
                          {reconocimiento.tipo || 'Reconocimiento'}
                        </p>
                        {reconocimiento.descripcion && (
                          <p className="text-xs opacity-90 line-clamp-2">
                            {reconocimiento.descripcion}
                          </p>
                        )}
                        <p className="text-xs mt-2 opacity-75">
                          {new Date(reconocimiento.fecha).toLocaleDateString('es-ES', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha - Formulario de edición */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-6 text-slate-900">Editar Información</h3>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base font-medium"
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                  Apellido
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-base font-medium"
                  placeholder="Tu apellido"
                  required
                />
              </div>

              {/* Intereses */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Heart className="inline w-5 h-5 text-green-600 mr-1" />
                  Intereses
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Medio ambiente, Reciclaje..."
                  />
                  <button
                    type="button"
                    onClick={addInterest}
                    className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <span
                      key={interest}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="hover:text-green-900 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {interests.length === 0 && (
                    <p className="text-sm text-slate-500">No has agregado intereses aún</p>
                  )}
                </div>
              </div>

              {/* Hobbies */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Smile className="inline w-5 h-5 text-blue-600 mr-1" />
                  Hobbies
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newHobby}
                    onChange={(e) => setNewHobby(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Ciclismo, Fotografía..."
                  />
                  <button
                    type="button"
                    onClick={addHobby}
                    className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hobbies.map((hobby) => (
                    <span
                      key={hobby}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      {hobby}
                      <button
                        type="button"
                        onClick={() => removeHobby(hobby)}
                        className="hover:text-blue-900 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {hobbies.length === 0 && (
                    <p className="text-sm text-slate-500">No has agregado hobbies aún</p>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="pt-2 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={signOut}
                  className="px-6 py-2 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 font-medium transition"
                >
                  Cerrar Sesión
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 text-white font-medium hover:opacity-90 transition shadow-md disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

