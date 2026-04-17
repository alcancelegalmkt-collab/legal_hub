import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Lead, LeadsResponse } from '../types';
import api from '../services/api';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.getLeads(1, 5);
      setLeads(response.leads);

      const newLeads = response.leads.filter((l) => l.status === 'new').length;
      const qualified = response.leads.filter((l) => l.status === 'qualified').length;

      setStats({
        totalLeads: response.total,
        newLeads,
        qualifiedLeads: qualified,
        conversionRate: response.total > 0 ? Math.round((qualified / response.total) * 100) : 0,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Bem-vindo ao Legal Hub</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total de Leads</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalLeads}</p>
              </div>
              <div className="text-blue-200 text-4xl">📊</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Novos Leads</p>
                <p className="text-3xl font-bold text-green-600">{stats.newLeads}</p>
              </div>
              <div className="text-green-200 text-4xl">✨</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Qualificados</p>
                <p className="text-3xl font-bold text-purple-600">{stats.qualifiedLeads}</p>
              </div>
              <div className="text-purple-200 text-4xl">👤</div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Taxa Conversão</p>
                <p className="text-3xl font-bold text-orange-600">{stats.conversionRate}%</p>
              </div>
              <div className="text-orange-200 text-4xl">📈</div>
            </div>
          </Card>
        </div>

        {/* Recent Leads */}
        <Card>
          <CardHeader title="Leads Recentes" subtitle="Últimos 5 leads cadastrados" />
          <CardBody>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : leads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nome</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Área Jurídica</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Urgência</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Score IA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b hover:bg-gray-50 transition">
                        <td className="py-3 px-4 text-sm text-gray-900">{lead.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{lead.legalArea}</td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              lead.status === 'new'
                                ? 'bg-blue-100 text-blue-800'
                                : lead.status === 'qualified'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              lead.urgency === 'high'
                                ? 'bg-red-100 text-red-800'
                                : lead.urgency === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {lead.urgency}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-1">
                            <div className="w-12 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-legal-600 h-2 rounded-full"
                                style={{ width: `${lead.aiQualificationScore}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">{lead.aiQualificationScore}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Nenhum lead encontrado</div>
            )}
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
