import "./Dashboard.css";
import { useAuth } from "../components/contexts/AuthContext";

export function Dashboard() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <div className="dashboard-hero min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-xl text-center">
        <h1 className="text-3xl font-bold mb-2 text-slate-900">Bienvenido al Dashboard</h1>
        <p className="mb-8 muted">Te has autenticado correctamente en SmartCampus UCV</p>
        <div className="mb-6">
          <div className="font-semibold text-lg">👤 Datos del usuario:</div>
          <div>Nombre: <b>{user.nombre} {user.apellido}</b></div>
          <div>E-mail: <b>{user.correoInstitucional}</b></div>
          <div>Rol: <b>{user.rol}</b></div>
          {user.intereses && <div>Intereses: <b>{user.intereses}</b></div>}
          {user.hobbies && <div>Hobbies: <b>{user.hobbies}</b></div>}
          {user.foto && <div><img src={user.foto} alt="Foto" className="mx-auto w-24 h-24 rounded-full mt-3" /></div>}
        </div>
        <button onClick={signOut} className="bg-red-100 text-red-600 rounded-xl px-5 py-2 font-bold hover:bg-red-200 transition">Cerrar sesión</button>
      </div>
    </div>
  );
}
