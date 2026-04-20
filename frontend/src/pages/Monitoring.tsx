import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';

interface DashboardMetrics {
  jobs: { active: number; jobNames: string[] };
  cases: { total: number; active: number; completed: number; new: number };
  clients: { total: number; active: number };
  emails: { sent: number; failed: number; pending: number };
  webhooks: { triggered: number; processed: number };
  system: {
    uptime: number;
    memoryUsage: { rss: number; heapUsed: number; heapTotal: number };
    timestamp: string;
  };
}

interface HealthStatus {
  status: 'healthy' | 'warning' | 'critical';
  checks: {
    database: 'ok' | 'error';
    jobs: 'ok' | 'error';
    memoryUsage: 'ok' | 'warning' | 'critical';
    errorRate: 'ok' | 'warning' | 'critical';
  };
  message: string;
}

interface HourlyData {
  hour: string;
  emails: number;
  webhooks: number;
  cases: number;
}

export default function Monitoring() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000); // Atualizar a cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [metricsRes, healthRes, hourlyRes] = await Promise.all([
        api.getDashboardMetrics(),
        api.get('/monitoring/health'),
        api.get('/monitoring/hourly'),
      ]);

      setMetrics(metricsRes.data.metrics);
      setHealth(healthRes.data.health);
      setHourlyData(hourlyRes.data.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar dados de monitoramento');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'healthy') return 'text-green-600';
    if (status === 'warning') return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBg = (status: string) => {
    if (status === 'healthy') return 'bg-green-50 border-green-200';
    if (status === 'warning') return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getCheckColor = (checkStatus: string) => {
    if (checkStatus === 'ok') return 'text-green-600';
    if (checkStatus === 'warning') return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-red-800">
        <h3 className="font-bold mb-2">Erro</h3>
        <p>{error}</p>
        <button
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Dashboard de Monitoramento</h1>
          <p className="text-gray-600">Acompanhe a saúde e atividade do seu sistema Legal Hub</p>
        </div>

        {/* Health Status */}
        {health && (
          <div className={`mb-8 p-6 rounded-lg border-2 ${getStatusBg(health.status)}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Status do Sistema</h2>
              <span className={`text-2xl font-bold ${getStatusColor(health.status)}`}>
                {health.status === 'healthy'
                  ? '✅'
                  : health.status === 'warning'
                    ? '⚠️'
                    : '❌'}
              </span>
            </div>

            <p className={`text-lg font-semibold mb-4 ${getStatusColor(health.status)}`}>
              {health.message}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(health.checks).map(([check, status]) => (
                <div key={check} className="bg-white p-3 rounded">
                  <p className="text-sm text-gray-600 capitalize">{check.replace(/_/g, ' ')}</p>
                  <p className={`text-sm font-bold ${getCheckColor(status)}`}>
                    {status.toUpperCase()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPI Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Casos */}
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm mb-2">📋 Casos</p>
              <p className="text-3xl font-bold text-purple-600 mb-2">{metrics.cases.total}</p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>Ativos: {metrics.cases.active}</div>
                <div>Concluídos: {metrics.cases.completed}</div>
                <div>Novos: {metrics.cases.new}</div>
              </div>
            </div>

            {/* Clientes */}
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm mb-2">👥 Clientes</p>
              <p className="text-3xl font-bold text-blue-600 mb-2">{metrics.clients.total}</p>
              <div className="text-xs text-gray-500">
                Ativos: {metrics.clients.active}
              </div>
            </div>

            {/* Emails */}
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm mb-2">📧 Emails</p>
              <p className="text-3xl font-bold text-green-600 mb-2">{metrics.emails.sent}</p>
              <div className="text-xs text-gray-500 space-y-1">
                <div className="text-red-600">Falhas: {metrics.emails.failed}</div>
                <div>Pendentes: {metrics.emails.pending}</div>
              </div>
            </div>

            {/* Jobs */}
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-gray-600 text-sm mb-2">⏰ Jobs Ativos</p>
              <p className="text-3xl font-bold text-orange-600 mb-2">{metrics.jobs.active}</p>
              <div className="text-xs text-gray-500">
                {metrics.jobs.jobNames.join(', ')}
              </div>
            </div>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Atividade por Hora */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Atividade (últimas 24h)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="emails" fill="#10B981" name="Emails" />
                <Bar dataKey="webhooks" fill="#3B82F6" name="Webhooks" />
                <Bar dataKey="cases" fill="#8B5CF6" name="Casos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição de Casos */}
          {metrics && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Distribuição de Casos</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Ativos', value: metrics.cases.active },
                      { name: 'Novos', value: metrics.cases.new },
                      { name: 'Concluídos', value: metrics.cases.completed },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }: any) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="#3B82F6" />
                    <Cell fill="#F59E0B" />
                    <Cell fill="#10B981" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* System Info */}
        {metrics && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Informações do Sistema</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">⏱️ Uptime</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatUptime(metrics.system.uptime)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">💾 Memória (Heap)</p>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.system.memoryUsage.heapUsed} / {metrics.system.memoryUsage.heapTotal} MB
                </p>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(metrics.system.memoryUsage.heapUsed / metrics.system.memoryUsage.heapTotal) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">📦 RSS Memory</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.system.memoryUsage.rss} MB
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">🕐 Última atualização</p>
                <p className="text-sm font-mono text-gray-700">
                  {new Date(metrics.system.timestamp).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Dashboard atualizado automaticamente a cada 10 segundos</p>
          <button
            onClick={loadDashboardData}
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            🔄 Atualizar agora
          </button>
        </div>
      </div>
    </div>
  );
}
