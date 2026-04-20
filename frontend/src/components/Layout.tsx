import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: UsersIcon, label: 'Leads', path: '/leads' },
    { icon: DocumentTextIcon, label: 'Propostas', path: '/proposals' },
    { icon: UsersIcon, label: 'Clientes', path: '/clients' },
    { icon: DocumentTextIcon, label: 'Casos', path: '/cases' },
    { icon: DocumentTextIcon, label: 'Documentos', path: '/documents' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-legal-600">Legal Hub</h1>
          <p className="text-sm text-gray-600">Automação Jurídica</p>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-legal-600 transition"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 border-t p-4">
          <div className="bg-gray-50 p-3 rounded mb-3">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-600">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
          >
            <ArrowLeftOnRectangleIcon className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
          </div>
          <button className="text-gray-600 hover:text-gray-900">
            <CogIcon className="w-6 h-6" />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
