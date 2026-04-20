import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Lead, Responsavel, Dependente } from '../types';
import api from '../services/api';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<{ status?: string; legalArea?: string }>({});
  const [showForm, setShowForm] = useState(false);
  const [dependentes, setDependentes] = useState<Partial<Dependente>[]>([]);

  const [formData, setFormData] = useState({
    legalArea: '',
    tipoDemanda: '',
    resumoCaso: '',
    objetivoCliente: '',
    urgency: 'medium' as const,
    possuiDependente: false,
    responsavel: {
      nomeCompleto: '',
      cpf: '',
      email: '',
      telefone: '',
      endereco: '',
      cidade: '',
      estado: '',
      estadoCivil: '',
      profissao: '',
    },
    valorProposto: 0,
    entrada: 0,
    parcelamento: 1,
    formaPagamento: '',
  });

  useEffect(() => {
    fetchLeads();
  }, [page, filter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await api.getLeads(page, 20, filter.status, filter.legalArea);
      setLeads(response.leads || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        possuiDependente: dependentes.length > 0,
        dependentes: dependentes.length > 0 ? dependentes : [],
      };

      await api.createLead(payload as any);
      setFormData({
        legalArea: '',
        tipoDemanda: '',
        resumoCaso: '',
        objetivoCliente: '',
        urgency: 'medium',
        possuiDependente: false,
        responsavel: {
          nomeCompleto: '',
          cpf: '',
          email: '',
          telefone: '',
          endereco: '',
          cidade: '',
          estado: '',
          estadoCivil: '',
          profissao: '',
        },
        valorProposto: 0,
        entrada: 0,
        parcelamento: 1,
        formaPagamento: '',
      });
      setDependentes([]);
      setShowForm(false);
      fetchLeads();
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      alert('Erro ao criar lead');
    }
  };

  const addDependente = () => {
    setDependentes([
      ...dependentes,
      {
        nomeCompleto: '',
        cpf: '',
        dataNascimento: '',
        parentesco: '',
        condicaoEspecifica: '',
      },
    ]);
  };

  const removeDependente = (index: number) => {
    setDependentes(dependentes.filter((_, i) => i !== index));
  };

  const updateDependente = (index: number, field: string, value: any) => {
    const updated = [...dependentes];
    updated[index] = { ...updated[index], [field]: value };
    setDependentes(updated);
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Leads</h2>
            <p className="text-gray-600 mt-1">Gestão de potenciais clientes e demandas jurídicas</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Novo Lead
          </button>
        </div>

        {/* New Lead Form */}
        {showForm && (
          <Card>
            <CardHeader title="Novo Lead - Pré-Cadastro de Demanda Jurídica" />
            <CardBody>
              <form onSubmit={handleCreateLead} className="space-y-6">
                {/* Dados do Caso */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                    Dados da Demanda
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={formData.legalArea}
                      onChange={(e) => setFormData({ ...formData, legalArea: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      required
                    >
                      <option value="">Área Jurídica *</option>
                      <option value="Família">Família</option>
                      <option value="Trabalhista">Trabalhista</option>
                      <option value="Civil">Civil</option>
                      <option value="Penal">Penal</option>
                      <option value="Administrativo">Administrativo</option>
                      <option value="Previdenciário">Previdenciário</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Tipo de Demanda (ex: Ação de Alimentos) *"
                      value={formData.tipoDemanda}
                      onChange={(e) => setFormData({ ...formData, tipoDemanda: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      required
                    />
                    <select
                      value={formData.urgency}
                      onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="low">Baixa urgência</option>
                      <option value="medium">Média urgência</option>
                      <option value="high">Alta urgência</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Forma de Pagamento (ex: à vista, parcelado)"
                      value={formData.formaPagamento}
                      onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <textarea
                    placeholder="Resumo do Caso *"
                    value={formData.resumoCaso}
                    onChange={(e) => setFormData({ ...formData, resumoCaso: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none mt-4"
                    rows={3}
                    required
                  />
                  <textarea
                    placeholder="Objetivo do Cliente"
                    value={formData.objetivoCliente}
                    onChange={(e) => setFormData({ ...formData, objetivoCliente: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none mt-4"
                    rows={2}
                  />
                </div>

                {/* Dados do Responsável */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                    Dados do Responsável/Cliente
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Nome Completo *"
                      value={formData.responsavel.nomeCompleto}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          responsavel: { ...formData.responsavel, nomeCompleto: e.target.value },
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email *"
                      value={formData.responsavel.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          responsavel: { ...formData.responsavel, email: e.target.value },
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="CPF"
                      value={formData.responsavel.cpf}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          responsavel: { ...formData.responsavel, cpf: e.target.value },
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="Telefone"
                      value={formData.responsavel.telefone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          responsavel: { ...formData.responsavel, telefone: e.target.value },
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Profissão"
                      value={formData.responsavel.profissao}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          responsavel: { ...formData.responsavel, profissao: e.target.value },
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <select
                      value={formData.responsavel.estadoCivil}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          responsavel: { ...formData.responsavel, estadoCivil: e.target.value },
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="">Estado Civil</option>
                      <option value="solteiro">Solteiro(a)</option>
                      <option value="casado">Casado(a)</option>
                      <option value="divorciado">Divorciado(a)</option>
                      <option value="viúvo">Viúvo(a)</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Endereço"
                      value={formData.responsavel.endereco}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          responsavel: { ...formData.responsavel, endereco: e.target.value },
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={formData.responsavel.cidade}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          responsavel: { ...formData.responsavel, cidade: e.target.value },
                        })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Estado (UF)"
                      value={formData.responsavel.estado}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          responsavel: { ...formData.responsavel, estado: e.target.value },
                        })
                      }
                      maxLength={2}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                {/* Honorários */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                    Valores e Forma de Pagamento
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Valor Proposto"
                      value={formData.valorProposto}
                      onChange={(e) =>
                        setFormData({ ...formData, valorProposto: parseFloat(e.target.value) || 0 })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Entrada"
                      value={formData.entrada}
                      onChange={(e) =>
                        setFormData({ ...formData, entrada: parseFloat(e.target.value) || 0 })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Número de Parcelas"
                      value={formData.parcelamento}
                      onChange={(e) =>
                        setFormData({ ...formData, parcelamento: parseInt(e.target.value) || 1 })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                      min="1"
                    />
                  </div>
                </div>

                {/* Dependentes */}
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Beneficiários/Dependentes
                    </h3>
                    <button
                      type="button"
                      onClick={addDependente}
                      className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition"
                    >
                      + Adicionar Dependente
                    </button>
                  </div>
                  <div className="space-y-4">
                    {dependentes.map((dep, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative"
                      >
                        <button
                          type="button"
                          onClick={() => removeDependente(idx)}
                          className="absolute top-2 right-2 text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Nome Completo"
                            value={dep.nomeCompleto || ''}
                            onChange={(e) =>
                              updateDependente(idx, 'nomeCompleto', e.target.value)
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Parentesco (filho, filha, neto...)"
                            value={dep.parentesco || ''}
                            onChange={(e) =>
                              updateDependente(idx, 'parentesco', e.target.value)
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          />
                          <input
                            type="date"
                            placeholder="Data de Nascimento"
                            value={dep.dataNascimento || ''}
                            onChange={(e) =>
                              updateDependente(idx, 'dataNascimento', e.target.value)
                            }
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          />
                          <input
                            type="text"
                            placeholder="CPF"
                            value={dep.cpf || ''}
                            onChange={(e) => updateDependente(idx, 'cpf', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
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
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Responsável
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Área Jurídica
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Demanda
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Urgência</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead: any) => (
                      <tr key={lead.id} className="border-b hover:bg-gray-50 transition">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {lead.responsavel?.nomeCompleto || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {lead.responsavel?.email}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{lead.legalArea}</td>
                        <td className="py-3 px-4 text-gray-600">{lead.tipoDemanda}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              lead.status
                            )}`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${getUrgencyColor(lead.urgency)}`}>
                            {lead.urgency === 'high' && '🔴 Alta'}
                            {lead.urgency === 'medium' && '🟡 Média'}
                            {lead.urgency === 'low' && '🟢 Baixa'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {lead.valorProposto ? `R$ ${lead.valorProposto.toLocaleString('pt-BR')}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum lead encontrado. Clique em "Novo Lead" para criar.
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
};

export default Leads;
