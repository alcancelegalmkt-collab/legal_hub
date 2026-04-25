import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Leads from './pages/Leads';
import Proposals from './pages/Proposals';
import Clients from './pages/Clients';
import Cases from './pages/Cases';
import Documents from './pages/Documents';
import WhatsAppInbox from './pages/WhatsAppInbox';

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

        <Route path="/" element={<Navigate to="/leads" replace />} />

        <Route
          path="/leads"
          element={<ProtectedRoute element={<Leads />} />}
        />

        <Route
          path="/proposals"
          element={<ProtectedRoute element={<Proposals />} />}
        />

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
          path="/whatsapp"
          element={<ProtectedRoute element={<WhatsAppInbox />} />}
        />

        <Route path="*" element={<Navigate to="/leads" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
