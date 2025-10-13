import "./App.css";
import { useAuth } from "./components/contexts/AuthContext";
import { LoginPage } from "./components/auth/LoginPage";
import { Dashboard } from "./pages/Dashboard";

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

  // Si hay usuario logueado, mostrar el dashboard
  return <Dashboard />;
}

export default App;
