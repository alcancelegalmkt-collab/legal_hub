import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Lead } from '../types';
import api from '../services/api';
import { PlusIcon } from '@heroicons/react/24/outline';

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<{ status?: string; legalArea?: string }>({});
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    legalArea: '',
    description: '',
    urgency: 'medium' as const,
    source: 'whatsapp' as const,
  });

  useEffect(() => {
    fetchLeads();
  }, [page, filter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await api.getLeads(page, 20, filter.status, filter.legalArea);
      setLeads(response.leads);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLead(formData);
      setFormData({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        legalArea: '',
        description: '',
        urgency: 'medium',
        source: 'whatsapp',
      });
      setShowForm(false);
      fetchLeads();
    } catch (error) {
      console.error('Failed to create lead:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
      converted: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Leads</h2>
            <p className="text-gray-600 mt-1">Gestão de potenciais clientes</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-legal-600 text-white px-4 py-2 rounded-lg hover:bg-legal-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Novo Lead
          </button>
        </div>

        {/* New Lead Form */}
        {showForm && (
          <Card>
            <CardHeader title="Novo Lead" />
            <CardBody>
              <form onSubmit={handleCreateLead} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Telefone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
                  />
                  <select
                    value={formData.legalArea}
                    onChange={(e) => setFormData({ ...formData, legalArea: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
                    required
                  >
                    <option value="">Área Jurídica</option>
                    <option value="trabalhista">Trabalhista</option>
                    <option value="família">Família</option>
                    <option value="civil">Civil</option>
                    <option value="penal">Penal</option>
                    <option value="administrativo">Administrativo</option>
                  </select>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
                  >
                    <option value="low">Baixa urgência</option>
                    <option value="medium">Média urgência</option>
                    <option value="high">Alta urgência</option>
                  </select>
                </div>
                <textarea
                  placeholder="Descrição do caso"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-legal-600 text-white rounded-lg hover:bg-legal-700 transition"
                  >
                    Criar Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {/* Leads Table */}
        <Card>
          <CardHeader title={`Leads (${total})`} />
          <CardBody>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : leads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nome</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Área</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Score IA</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b hover:bg-gray-50 transition">
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">{lead.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{lead.email}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{lead.legalArea}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(lead.status)}`}>
                            {lead.status}
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
                            {lead.aiQualificationScore}%
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <button className="text-legal-600 hover:text-legal-700 font-medium">Ver</button>
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

export default Leads;
