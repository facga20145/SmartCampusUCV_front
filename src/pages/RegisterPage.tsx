import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/contexts/AuthContext';

export default function RegisterPage() {
  const { signUp } = useAuth();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correoInstitucional, setCorreoInstitucional] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [intereses, setIntereses] = useState('');
  const [hobbies, setHobbies] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!correoInstitucional.endsWith('@ucv.edu.pe')) {
      setError('Usa tu correo institucional @ucv.edu.pe');
      return;
    }

    try {
      const result = await signUp(correoInstitucional, contrasena, nombre, apellido, intereses, hobbies);
      
      if (result.error) {
        // Manejar diferentes tipos de errores
        const errorMessage = result.error.message;
        
        if (errorMessage.toLowerCase().includes('ya existe') || 
            errorMessage.toLowerCase().includes('already exists') ||
            errorMessage.toLowerCase().includes('duplicate') ||
            errorMessage.toLowerCase().includes('correo') && errorMessage.toLowerCase().includes('registrado')) {
          setError('Este correo ya está registrado. Por favor, usa otro correo o inicia sesión.');
        } else {
          setError(errorMessage || 'Error al registrar');
        }
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      // Fallback para errores no manejados por el contexto
      const errorMessage = err.message || 'Error al registrar';
      
      if (errorMessage.toLowerCase().includes('ya existe') || 
          errorMessage.toLowerCase().includes('already exists') ||
          errorMessage.toLowerCase().includes('duplicate') ||
          errorMessage.toLowerCase().includes('correo') && errorMessage.toLowerCase().includes('registrado')) {
        setError('Cuenta ya existente. Por favor, usa otro correo o inicia sesión.');
      } else {
        setError(errorMessage);
      }
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white shadow rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">¡Registro exitoso!</h2>
          <p className="text-gray-600 mb-6">Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión con tu correo y contraseña.</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Crear cuenta nueva</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error en el registro</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                {error.includes('ya está registrado') && (
                  <p className="text-sm text-red-600 mt-2">
                    <Link to="/" className="font-medium underline hover:text-red-800">
                      ¿Quieres iniciar sesión en su lugar?
                    </Link>
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo institucional</label>
            <input
              type="email"
              value={correoInstitucional}
              onChange={(e) => setCorreoInstitucional(e.target.value)}
              placeholder="usuario@ucv.edu.pe"
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Intereses</label>
            <input
              type="text"
              value={intereses}
              onChange={(e) => setIntereses(e.target.value)}
              placeholder="Arte, Voluntariado"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hobbies</label>
            <input
              type="text"
              value={hobbies}
              onChange={(e) => setHobbies(e.target.value)}
              placeholder="Pintura, Lectura"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Registrarme
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link to="/" className="text-blue-600 hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}