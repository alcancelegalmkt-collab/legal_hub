import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      // Error is already set in store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-legal-600 to-legal-700">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-legal-600 mb-2">Legal Hub</h1>
            <p className="text-gray-600">Automação de Escritório de Advocacia</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 focus:border-transparent outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? '👁' : '👁‍🗨'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-legal-600 text-white py-2 rounded-lg font-medium hover:bg-legal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Conectando...' : 'Conectar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Não tem conta?{' '}
              <Link to="/register" className="text-legal-600 hover:text-legal-700 font-medium">
                Registre-se
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
            <p className="font-semibold mb-2">Demo Credentials:</p>
            <p>Email: admin@legal-hub.com</p>
            <p>Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
