import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { signIn } = useAuth();
  const [correoInstitucional, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(correoInstitucional, contrasena);
    if (error) {
      setError('Credenciales incorrectas. Por favor intenta de nuevo.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col items-center justify-center text-center space-y-6 p-8">
          <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <span className="text-6xl text-white">🌿</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">SmartCampus UCV</h1>
            <p className="text-lg text-slate-600">Sostenibilidad en tu universidad</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 space-y-3 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">🌱</span>
              </div>
              <p className="text-slate-700 text-sm">Actividades eco-friendly</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">🎓</span>
              </div>
              <p className="text-slate-700 text-sm">Eventos universitarios</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-600 text-sm font-bold">🌍</span>
              </div>
              <p className="text-slate-700 text-sm">Impacto ambiental</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Iniciar Sesión</h2>
            <p className="text-slate-600">Bienvenido de vuelta a SmartCampus</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="correoInstitucional" className="block text-sm font-medium text-slate-700 mb-2">
                Correo Institucional
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">✉️</span>
                <input
                  id="correoInstitucional"
                  type="email"
                  value={correoInstitucional}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="tu.correo@ucv.edu.ve"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="contrasena" className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔒</span>
                <input
                  id="contrasena"
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
            <p className="mt-4 text-sm text-slate-600 text-center">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">Crear cuenta</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
