import { useState } from 'react';
import { useAuth } from '../components/contexts/AuthContext';
import { User, Mail, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function RegisterPage() {
  const { signUp } = useAuth();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correoInstitucional, setCorreoInstitucional] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!correoInstitucional.endsWith('@ucv.edu.pe')) {
      setError('Debe usar un correo institucional (@ucv.edu.pe)');
      return;
    }

    setLoading(true);
    const { error } = await signUp(correoInstitucional, contrasena, nombre, apellido);

    if (error) {
      setError('Error al crear la cuenta. El correo puede estar en uso.');
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:flex flex-col items-center justify-center text-center space-y-6 p-8">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-green-500 rounded-3xl flex items-center justify-center shadow-lg transform rotate-6 hover:rotate-0 transition-transform duration-300">
            <User className="w-16 h-16 text-white" strokeWidth={2.5} />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-slate-900">Únete al Cambio</h1>
            <p className="text-lg text-slate-600">Sé parte de la comunidad sostenible</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 space-y-3 border border-slate-200">
            <p className="text-slate-700 text-sm font-medium">Al registrarte podrás:</p>
            <ul className="space-y-2 text-left text-slate-600 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Inscribirte en actividades sostenibles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Recibir recomendaciones personalizadas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Conectar con otros estudiantes</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Crear Cuenta</h2>
            <p className="text-slate-600">Completa los datos para comenzar</p>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">¡Registro exitoso!</h3>
              <p className="text-slate-600 mb-6">Tu cuenta ha sido creada correctamente.</p>
              <Link
                to="/dashboard"
                className="w-full inline-block py-3 px-4 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                Ir al Dashboard
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="nombre"
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Juan"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="apellido" className="block text-sm font-medium text-slate-700 mb-2">
                    Apellido
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      id="apellido"
                      type="text"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Pérez"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="correoInstitucional" className="block text-sm font-medium text-slate-700 mb-2">
                  Correo Institucional
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="correoInstitucional"
                    type="email"
                    value={correoInstitucional}
                    onChange={(e) => setCorreoInstitucional(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="ejemplo@ucv.edu.pe"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contrasena" className="block text-sm font-medium text-slate-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="contrasena"
                    type="password"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="******"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmarContrasena" className="block text-sm font-medium text-slate-700 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="confirmarContrasena"
                    type="password"
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="******"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                  loading
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>

              <div className="text-center mt-6">
                <p className="text-slate-600 text-sm">
                  ¿Ya tienes una cuenta?{' '}
                  <Link to="/" className="text-blue-600 font-medium hover:text-blue-700">
                    Iniciar Sesión
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}