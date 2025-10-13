import "./App.css";
import { useAuth } from "./components/contexts/AuthContext";
import { LoginPage } from "./components/auth/LoginPage";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Cargando...</p>
      </div>
    );
  }

  // Si no hay sesión, mostrar el login
  if (!user) {
    return <LoginPage onSwitchToRegister={() => {}} />;
  }

  // Si hay usuario logueado, mostrar bienvenida
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-blue-600 mb-2">
        ¡Bienvenido, {user.fullName || user.email}!
      </h1>
      <p className="text-gray-600">Ya estás logueado ✅</p>
    </div>
  );
}

export default App;
