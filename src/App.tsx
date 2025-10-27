import "./App.css";
import { useAuth, useRole } from "./components/contexts/AuthContext";
import { LoginPage } from "./components/auth/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Componente para rutear según rol
function RoleBasedRouter() {
  const { user } = useAuth();
  const role = useRole();

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

  if (role === 'estudiante') {
    return (
      <Router>
        <Routes>
          <Route path="/home" element={<HomePage canCreateActivities={false} />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Router>
    );
  }

  // Rutas para organizadores y administradores (pueden crear actividades)
  const canCreateActivities = role === 'organizador' || role === 'administrador';
  
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<HomePage canCreateActivities={canCreateActivities} />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );

}

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg">Cargando...</p>
      </div>
    );
  }

  return <RoleBasedRouter />;
}

export default App;
