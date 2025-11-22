import { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Heart, Smile, Camera, Save, Lock, Eye, EyeOff, LogOut } from 'lucide-react';
import { useAuth } from '../components/contexts/AuthContext';
import { Link } from 'react-router-dom';
import '../assets/styles/ProfilePage.css';

export function ProfilePage() {
  const { user, signOut } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [newHobby, setNewHobby] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (user) {
      setFirstName(user.nombre || '');
      setLastName(user.apellido || '');
      setAvatarUrl(user.foto || '');
      setInterests(user.intereses ? user.intereses.split(',').map(i => i.trim()) : []);
      setHobbies(user.hobbies ? user.hobbies.split(',').map(h => h.trim()) : []);
    }
  }, [user]);

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
      const API_URL = import.meta.env.VITE_API_URL;
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
    } catch (error) {
      onShowToast('Error al actualizar el perfil', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      onShowToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      onShowToast('Las contraseñas no coinciden', 'error');
      return;
    }
    
    setChangingPassword(true);
    
    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado');
      const API_URL = import.meta.env.VITE_API_URL;
      if (!user || !user.id) throw new Error('Usuario no encontrado');
      const res = await fetch(`${API_URL}/usuarios/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          contrasena: newPassword,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Error al cambiar la contraseña');
      }
      onShowToast('Contraseña actualizada con éxito', 'success');
      setShowPasswordChange(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      onShowToast('Error al cambiar la contraseña', 'error');
    } finally {
      setChangingPassword(false);
    }
  }

  if (!user) {
    return <div className="text-center py-10">Cargando perfil...</div>;
  }

  return (
    <div className="profile-page bg-slate-50 min-h-screen pb-10">
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-medium`}>
          {toastMessage}
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">Mi Perfil</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-1/3 flex flex-col items-center">
                <div className="relative w-40 h-40 rounded-full overflow-hidden bg-slate-200 mb-4">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <User size={64} />
                    </div>
                  )}
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full cursor-pointer hover:bg-green-600 transition-colors">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-slate-500 text-center">
                  Haz clic en el ícono de cámara para cambiar tu foto
                </p>
              </div>
              
              <form onSubmit={handleSaveProfile} className="w-full md:w-2/3 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">
                      Nombre
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">
                      Apellido
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Tu apellido"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                    Correo Institucional
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={user.correoInstitucional}
                      disabled
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-600 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">El correo no se puede modificar</p>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-2">
                    Rol
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="role"
                      type="text"
                      value={user.rol}
                      disabled
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 text-slate-600 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">El rol es asignado por el sistema</p>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Preferencias e Intereses</h2>
            <p className="text-sm text-slate-600 mb-4 p-2 bg-blue-50 rounded-lg border border-blue-100 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Los cambios en intereses y hobbies se guardarán al hacer clic en el botón "Guardar Cambios" en la sección superior.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Heart className="inline w-5 h-5 text-green-600 mr-1" />
                  Intereses
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Medio ambiente, Reciclaje..."
                  />
                  <button
                    type="button"
                    onClick={addInterest}
                    className="px-6 py-2 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
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

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Smile className="inline w-5 h-5 text-blue-600 mr-1" />
                  Hobbies
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newHobby}
                    onChange={(e) => setNewHobby(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Ciclismo, Fotografía..."
                  />
                  <button
                    type="button"
                    onClick={addHobby}
                    className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
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
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              <Lock className="inline w-6 h-6 text-slate-700 mr-2" />
              Seguridad
            </h2>

            {!showPasswordChange ? (
              <button
                onClick={() => setShowPasswordChange(true)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                Cambiar Contraseña
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Repite la contraseña"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
            <h3 className="font-semibold text-green-900 mb-2">Impacto Sostenible</h3>
            <p className="text-sm text-green-700">
              Al participar en actividades sostenibles, contribuyes a un campus más verde y consciente
              del medio ambiente.
            </p>
          </div>

          <div className="flex justify-between items-center mt-6">
            <Link to="/home" className="px-6 py-3 bg-blue-100 text-blue-600 rounded-xl font-semibold hover:bg-blue-200 transition-colors">
              Volver al Inicio
            </Link>
            <button 
              onClick={signOut} 
              className="flex items-center gap-2 px-6 py-3 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}