import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';

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
          element={
            <ProtectedRoute
              element={
                <div className="flex items-center justify-center h-screen">
                  <h1 className="text-2xl text-gray-500">Página de Clientes em desenvolvimento</h1>
                </div>
              }
            />
          }
        />

        <Route
          path="/cases"
          element={
            <ProtectedRoute
              element={
                <div className="flex items-center justify-center h-screen">
                  <h1 className="text-2xl text-gray-500">Página de Casos em desenvolvimento</h1>
                </div>
              }
            />
          }
        />

        <Route
          path="/documents"
          element={
            <ProtectedRoute
              element={
                <div className="flex items-center justify-center h-screen">
                  <h1 className="text-2xl text-gray-500">Página de Documentos em desenvolvimento</h1>
                </div>
              }
            />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
