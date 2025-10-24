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
      await signUp(correoInstitucional, contrasena, nombre, apellido, intereses, hobbies);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al registrar');
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-2xl font-semibold mb-3">Registro exitoso</h2>
          <p className="text-gray-600 mb-6">Ya puedes iniciar sesión con tu cuenta.</p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
            <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
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