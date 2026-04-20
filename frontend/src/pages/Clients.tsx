import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardHeader, CardBody } from '../components/Card';
import Modal from '../components/Modal';
import { Client } from '../types';
import api from '../services/api';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [generatingDocument, setGeneratingDocument] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('proposal');
  const [formData, setFormData] = useState({
    name: '',
    cpfCnpj: '',
    email: '',
    phone: '',
    whatsapp: '',
    maritalStatus: '',
    profession: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    rg: '',
    nationality: 'Brasileira',
    needsFinancialAid: false,
  });

  useEffect(() => {
    fetchClients();
  }, [page, search]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await api.getClients(page, 20, search);
      setClients(response.clients);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedClient) {
        await api.updateClient(selectedClient.id, formData as any);
      } else {
        await api.createClient(formData as any);
      }
      setShowModal(false);
      resetForm();
      fetchClients();
    } catch (error) {
      console.error('Failed to save client:', error);
    }
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      cpfCnpj: client.cpfCnpj,
      email: client.email,
      phone: client.phone,
      whatsapp: client.whatsapp,
      maritalStatus: client.maritalStatus,
      profession: client.profession,
      address: client.address,
      city: client.city,
      state: client.state,
      zipCode: client.zipCode,
      rg: client.rg,
      nationality: client.nationality,
      needsFinancialAid: client.needsFinancialAid,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este cliente?')) {
      try {
        await api.updateClient(id, { active: false } as any);
        fetchClients();
      } catch (error) {
        console.error('Failed to delete client:', error);
      }
    }
  };

  const handleGenerateDocument = async () => {
    if (!selectedClient) return;

    try {
      setGeneratingDocument(true);
      const result = await api.generateDocumentAI(selectedClient.id, selectedDocumentType);
      alert(`Documento ${result.document.type} gerado com sucesso!`);
      setShowDocumentModal(false);
      fetchClients();
    } catch (error) {
      console.error('Failed to generate document:', error);
      alert('Erro ao gerar documento. Verifique o console para mais detalhes.');
    } finally {
      setGeneratingDocument(false);
    }
  };

  const handleOpenDocumentModal = (client: Client) => {
    setSelectedClient(client);
    setSelectedDocumentType('proposal');
    setShowDocumentModal(true);
  };

  const resetForm = () => {
    setSelectedClient(null);
    setFormData({
      name: '',
      cpfCnpj: '',
      email: '',
      phone: '',
      whatsapp: '',
      maritalStatus: '',
      profession: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      rg: '',
      nationality: 'Brasileira',
      needsFinancialAid: false,
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Clientes</h2>
            <p className="text-gray-600 mt-1">Gestão de clientes cadastrados</p>
          </div>
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 bg-legal-600 text-white px-4 py-2 rounded-lg hover:bg-legal-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Novo Cliente
          </button>
        </div>

        {/* Search */}
        <Card>
          <input
            type="text"
            placeholder="Buscar por nome, email ou CPF..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
          />
        </Card>

        {/* Clients Table */}
        <Card>
          <CardHeader title={`Clientes (${total})`} />
          <CardBody>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : clients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Nome
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        CPF/CNPJ
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Telefone
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Cidade
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-b hover:bg-gray-50 transition">
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                          {client.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {client.cpfCnpj}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{client.email}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{client.phone}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {client.city}, {client.state}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(client)}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="Editar"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDocumentModal(client)}
                              className="text-green-600 hover:text-green-800 transition"
                              title="Gerar Documento"
                            >
                              <DocumentPlusIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(client.id)}
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
              <div className="text-center py-8 text-gray-500">Nenhum cliente encontrado</div>
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

      {/* Document Generation Modal */}
      <Modal
        isOpen={showDocumentModal}
        title="Gerar Documento"
        onClose={() => setShowDocumentModal(false)}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Documento
            </label>
            <select
              value={selectedDocumentType}
              onChange={(e) => setSelectedDocumentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
            >
              <option value="proposal">Proposta de Honorários</option>
              <option value="contract">Contrato de Prestação de Serviços</option>
              <option value="power_of_attorney">Procuração</option>
              <option value="financial_aid_declaration">Declaração de Hipossuficiência</option>
            </select>
          </div>
          <p className="text-sm text-gray-600">
            Cliente: <strong>{selectedClient?.name}</strong>
          </p>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleGenerateDocument}
              disabled={generatingDocument}
              className="flex-1 px-4 py-2 bg-legal-600 text-white rounded-lg hover:bg-legal-700 disabled:opacity-50 transition"
            >
              {generatingDocument ? 'Gerando...' : 'Gerar'}
            </button>
            <button
              onClick={() => setShowDocumentModal(false)}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Client Form Modal */}
      <Modal
        isOpen={showModal}
        title={selectedClient ? 'Editar Cliente' : 'Novo Cliente'}
        onClose={handleCloseModal}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
              required
            />
            <input
              type="text"
              placeholder="CPF/CNPJ"
              value={formData.cpfCnpj}
              onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
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
            <input
              type="text"
              placeholder="RG"
              value={formData.rg}
              onChange={(e) => setFormData({ ...formData, rg: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
            />
            <input
              type="text"
              placeholder="Profissão"
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
            />
            <select
              value={formData.maritalStatus}
              onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
            >
              <option value="">Estado Civil</option>
              <option value="single">Solteiro(a)</option>
              <option value="married">Casado(a)</option>
              <option value="divorced">Divorciado(a)</option>
              <option value="widowed">Viúvo(a)</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Endereço"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
          />

          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Cidade"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
            />
            <input
              type="text"
              placeholder="UF"
              maxLength={2}
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
            />
            <input
              type="text"
              placeholder="CEP"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="financialAid"
              checked={formData.needsFinancialAid}
              onChange={(e) =>
                setFormData({ ...formData, needsFinancialAid: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label htmlFor="financialAid" className="text-sm text-gray-700">
              Necessita gratuidade da justiça
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-legal-600 text-white rounded-lg hover:bg-legal-700 transition"
            >
              {selectedClient ? 'Atualizar' : 'Criar'} Cliente
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

export default Clients;
