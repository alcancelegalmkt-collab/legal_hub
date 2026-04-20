import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import api from '../services/api';
import './Dashboard.css';

interface DashboardMetrics {
  documents: {
    total: number;
    signed: number;
    pending: number;
    byType: Record<string, number>;
    averageTimeToSign: number;
    signatureSuccessRate: number;
  };
  cases: {
    total: number;
    active: number;
    completed: number;
    averageCompletionTime: number;
    byArea: Record<string, number>;
  };
  team: {
    totalDocumentsGenerated: number;
    averageDocumentsPerDay: number;
    peakDay: string;
    documentsThisMonth: number;
    documentsThisWeek: number;
  };
  clients: {
    total: number;
    active: number;
    averageDocumentsPerClient: number;
    averageCasesPerClient: number;
  };
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/dashboard');
      setMetrics(response.data.metrics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!metrics) {
    return <div>Erro ao carregar dados</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard Analítico</h1>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Documentos Gerados</div>
          <div className="kpi-value">{metrics.documents.total}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Casos Completos</div>
          <div className="kpi-value">{metrics.cases.completed}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Clientes Ativos</div>
          <div className="kpi-value">{metrics.clients.active}</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
