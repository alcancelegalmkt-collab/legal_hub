import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardHeader, CardBody } from '../components/Card';
import Modal from '../components/Modal';
import { Case } from '../types';
import api from '../services/api';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Cases: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    primaryLawyerId: '',
    title: '',
    legalArea: '',
    description: '',
    caseNumber: '',
    court: '',
    caseValue: '',
    honorariesFee: '',
    honorariesFeeType: 'fixed',
    opposingParties: '',
  });

  useEffect(() => {
    fetchCases();
  }, [page, search, statusFilter]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await api.getCases(page, 20, {
        search,
        status: statusFilter || undefined,
      });
      setCases(response.cases);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        clientId: parseInt(formData.clientId),
        primaryLawyerId: parseInt(formData.primaryLawyerId),
        caseValue: formData.caseValue ? parseFloat(formData.caseValue) : null,
        honorariesFee: parseFloat(formData.honorariesFee),
      };

      if (selectedCase) {
        await api.updateCase(selectedCase.id, data as any);
      } else {
        await api.createCase(data as any);
      }
      setShowModal(false);
      resetForm();
      fetchCases();
    } catch (error) {
      console.error('Failed to save case:', error);
    }
  };

  const handleEdit = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setFormData({
      clientId: caseItem.clientId.toString(),
      primaryLawyerId: caseItem.primaryLawyerId.toString(),
      title: caseItem.title,
      legalArea: caseItem.legalArea,
      description: caseItem.description,
      caseNumber: caseItem.caseNumber,
      court: caseItem.court,
      caseValue: caseItem.caseValue ? caseItem.caseValue.toString() : '',
      honorariesFee: caseItem.honorariesFee.toString(),
      honorariesFeeType: caseItem.honorariesFeeType,
      opposingParties: caseItem.opposingParties,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este caso?')) {
      try {
        await api.updateCase(id, { status: 'archived' } as any);
        fetchCases();
      } catch (error) {
        console.error('Failed to delete case:', error);
      }
    }
  };

  const resetForm = () => {
    setSelectedCase(null);
    setFormData({
      clientId: '',
      primaryLawyerId: '',
      title: '',
      legalArea: '',
      description: '',
      caseNumber: '',
      court: '',
      caseValue: '',
      honorariesFee: '',
      honorariesFeeType: 'fixed',
      opposingParties: '',
    });
  };

  const handleOpenNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const statusLabels = {
    active: 'Ativo',
    closed: 'Fechado',
    suspended: 'Suspenso',
    archived: 'Arquivado',
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Casos</h2>
            <p className="text-gray-600 mt-1">Gestão de casos e processos</p>
          </div>
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 bg-legal-600 text-white px-4 py-2 rounded-lg hover:bg-legal-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Novo Caso
          </button>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col gap-4 p-4">
            <input
              type="text"
              placeholder="Buscar por título, número do caso ou cliente..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
            >
              <option value="">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="closed">Fechado</option>
              <option value="suspended">Suspenso</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>
        </Card>

        {/* Cases Table */}
        <Card>
          <CardHeader title={`Casos (${total})`} />
          <CardBody>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : cases.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Título
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Área
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Número
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Valor
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases.map((caseItem) => (
                      <tr key={caseItem.id} className="border-b hover:bg-gray-50 transition">
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                          {caseItem.title}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {caseItem.legalArea}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {caseItem.caseNumber || '-'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {caseItem.caseValue
                            ? `R$ ${parseFloat(caseItem.caseValue.toString()).toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}`
                            : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                              caseItem.status
                            )}`}
                          >
                            {statusLabels[caseItem.status as keyof typeof statusLabels]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(caseItem)}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="Editar"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(caseItem.id)}
                              className="text-red-600 hover:text-red-800 transition"
                              title="Deletar"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Nenhum caso encontrado</div>
            )}
          </CardBody>
        </Card>

        {/* Pagination */}
        {Math.ceil(total / 20) > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition"
            >
              Anterior
            </button>
            <span className="text-gray-600">
              Página {page} de {Math.ceil(total / 20)}
            </span>
            <button
              onClick={() => setPage(Math.min(Math.ceil(total / 20), page + 1))}
              disabled={page === Math.ceil(total / 20)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition"
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        title={selectedCase ? 'Editar Caso' : 'Novo Caso'}
        onClose={handleCloseModal}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="ID do Cliente"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
              required
            />
            <input
              type="number"
              placeholder="ID do Advogado"
              value={formData.primaryLawyerId}
              onChange={(e) => setFormData({ ...formData, primaryLawyerId: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
              required
            />
            <input
              type="text"
              placeholder="Título do Caso"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
              required
            />
            <input
              type="text"
              placeholder="Área Jurídica"
              value={formData.legalArea}
              onChange={(e) => setFormData({ ...formData, legalArea: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
              required
            />
            <input
              type="text"
              placeholder="Número do Caso"
              value={formData.caseNumber}
              onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
            />
            <input
              type="text"
              placeholder="Tribunal"
              value={formData.court}
              onChange={(e) => setFormData({ ...formData, court: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
            />
            <input
              type="number"
              placeholder="Valor do Caso"
              value={formData.caseValue}
              onChange={(e) => setFormData({ ...formData, caseValue: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
              step="0.01"
            />
            <input
              type="number"
              placeholder="Honorários"
              value={formData.honorariesFee}
              onChange={(e) => setFormData({ ...formData, honorariesFee: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
              required
              step="0.01"
            />
            <select
              value={formData.honorariesFeeType}
              onChange={(e) => setFormData({ ...formData, honorariesFeeType: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
            >
              <option value="fixed">Fixo</option>
              <option value="percentage">Percentual</option>
              <option value="hourly">Por Hora</option>
            </select>
          </div>

          <textarea
            placeholder="Descrição"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
            rows={3}
          />

          <input
            type="text"
            placeholder="Partes Opostas"
            value={formData.opposingParties}
            onChange={(e) => setFormData({ ...formData, opposingParties: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
          />

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-legal-600 text-white rounded-lg hover:bg-legal-700 transition"
            >
              {selectedCase ? 'Atualizar' : 'Criar'} Caso
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Cases;
