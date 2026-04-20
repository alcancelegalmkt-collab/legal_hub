import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Clients from './pages/Clients';
import Cases from './pages/Cases';
import Documents from './pages/Documents';
import Monitoring from './pages/Monitoring';
import EscavadorDashboard from './pages/EscavadorDashboard';

interface ProtectedRouteProps {
  element: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{element}</>;
};

const App: React.FC = () => {
  const { token, loadProfile } = useAuthStore();

  useEffect(() => {
    if (token) {
      loadProfile();
    }
  }, [token]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute element={<Dashboard />} />
          }
        />

        <Route
          path="/leads"
          element={
            <ProtectedRoute element={<Leads />} />
          }
        />

        {/* Placeholder routes for future pages */}
        <Route
          path="/clients"
          element={<ProtectedRoute element={<Clients />} />}
        />

        <Route
          path="/cases"
          element={<ProtectedRoute element={<Cases />} />}
        />

        <Route
          path="/documents"
          element={<ProtectedRoute element={<Documents />} />}
        />

        <Route
          path="/monitoring"
          element={<ProtectedRoute element={<Monitoring />} />}
        />

        <Route
          path="/escavador"
          element={<ProtectedRoute element={<EscavadorDashboard />} />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
