import "./App.css";
import { useAuth } from "./components/contexts/AuthContext";
import { LoginPage } from "./components/auth/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { Dashboard } from "./pages/Dashboard";
import { ProfilePage } from "./pages/ProfilePage";
import { HomePage } from "./pages/HomePage";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Cargando...</p>
      </div>
    );
  }

  // Si no hay sesión, mostrar rutas públicas (login y registro)
  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Router>
    );
  }

  // Si hay usuario logueado, mostrar las rutas protegidas
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
