import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardHeader, CardBody } from '../components/Card';
import ProposalPreview from '../components/ProposalPreview';
import { Lead } from '../types';
import api from '../services/api';
import {
  DocumentTextIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

const Proposals: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [filter, setFilter] = useState<{ status?: string }>({});

  useEffect(() => {
    fetchLeads();
  }, [filter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await api.getLeads(1, 100, filter.status);
      setLeads(response.leads || []);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProposal = (leadId: number) => {
    setSelectedLeadId(leadId);
    setShowPreview(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-green-100 text-green-800',
      proposal_generated: 'bg-purple-100 text-purple-800',
      proposal_sent: 'bg-indigo-100 text-indigo-800',
      closed: 'bg-gray-100 text-gray-800',
      lost: 'bg-red-100 text-red-800',
      converted: 'bg-emerald-100 text-emerald-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      low: 'text-blue-600',
      medium: 'text-yellow-600',
      high: 'text-red-600',
    };
    return colors[urgency] || 'text-gray-600';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Propostas de Honorários</h2>
          <p className="text-gray-600 mt-1">Gere e envie propostas profissionais para seus leads</p>
        </div>

        {/* Filters */}
        <Card>
          <CardBody>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Status
                </label>
                <select
                  value={filter.status || ''}
                  onChange={(e) =>
                    setFilter({ ...filter, status: e.target.value || undefined })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none w-full"
                >
                  <option value="">Todos os status</option>
                  <option value="new">Novo</option>
                  <option value="contacted">Contatado</option>
                  <option value="qualified">Qualificado</option>
                  <option value="proposal_generated">Proposta Gerada</option>
                  <option value="proposal_sent">Proposta Enviada</option>
                  <option value="converted">Convertido</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader title={`Leads (${leads.length})`} />
          <CardBody>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : leads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Cliente/Responsável
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Área Jurídica
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Tipo de Demanda
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Urgência
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead: any) => (
                      <tr key={lead.id} className="border-b hover:bg-gray-50 transition">
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                          {lead.responsavel?.nomeCompleto || 'N/A'}
                          <div className="text-xs text-gray-500">
                            {lead.responsavel?.email}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {lead.legalArea}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {lead.tipoDemanda}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              lead.status
                            )}`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`font-medium ${getUrgencyColor(lead.urgency)}`}>
                            {lead.urgency === 'high' && '🔴 Alta'}
                            {lead.urgency === 'medium' && '🟡 Média'}
                            {lead.urgency === 'low' && '🟢 Baixa'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <button
                            onClick={() => handleGenerateProposal(lead.id)}
                            className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium hover:bg-purple-50 px-3 py-1 rounded transition"
                            title="Gerar proposta"
                          >
                            <DocumentTextIcon className="w-4 h-4" />
                            Proposta
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum lead encontrado. Crie um novo lead para gerar propostas.
              </div>
            )}
          </CardBody>
        </Card>

        {/* Info Card */}
        <Card>
          <CardBody>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Como usar:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="text-purple-600">1.</span>
                  <span>Clique em "Proposta" em qualquer lead para gerar uma proposta personalizada</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">2.</span>
                  <span>Revise a proposta no preview e faça ajustes se necessário</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">3.</span>
                  <span>Baixe como PDF, envie por email ou envie via WhatsApp</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-purple-600">4.</span>
                  <span>Acompanhe a resposta do cliente e converta para cliente quando aceitar</span>
                </li>
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Proposal Preview Modal */}
      {selectedLeadId && (
        <ProposalPreview
          leadId={selectedLeadId}
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setSelectedLeadId(null);
          }}
        />
      )}
    </Layout>
  );
};

export default Proposals;
