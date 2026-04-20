import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardHeader, CardBody } from '../components/Card';
import Modal from '../components/Modal';
import { Document } from '../types';
import api from '../services/api';
import { PlusIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showZapSignModal, setShowZapSignModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [sendingToZapSign, setSendingToZapSign] = useState(false);
  const [zapSignData, setZapSignData] = useState({
    signerEmail: '',
    signerName: '',
  });
  const [formData, setFormData] = useState({
    clientId: '',
    caseId: '',
    type: 'contract',
    title: '',
    fileName: '',
    filePath: '',
    fileUrl: '',
  });

  useEffect(() => {
    fetchDocuments();
  }, [page, search, typeFilter, statusFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.getDocuments(page, 20, {
        search,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
      });
      setDocuments(response.documents);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        clientId: formData.clientId ? parseInt(formData.clientId) : undefined,
        caseId: formData.caseId ? parseInt(formData.caseId) : undefined,
      };

      if (selectedDocument) {
        await api.updateDocument(selectedDocument.id, data as any);
      } else {
        await api.createDocument(data as any);
      }
      setShowModal(false);
      resetForm();
      fetchDocuments();
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  };

  const handleEdit = (doc: Document) => {
    setSelectedDocument(doc);
    setFormData({
      clientId: doc.clientId ? doc.clientId.toString() : '',
      caseId: doc.caseId ? doc.caseId.toString() : '',
      type: doc.type,
      title: doc.title,
      fileName: doc.fileName,
      filePath: doc.filePath,
      fileUrl: doc.fileUrl,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este documento?')) {
      try {
        await api.deleteDocument(id);
        fetchDocuments();
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
  };

  const handleSendToSignature = async (id: number) => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      setSelectedDocument(doc);
      setZapSignData({ signerEmail: '', signerName: '' });
      setShowZapSignModal(true);
    }
  };

  const handleSendToZapSign = async () => {
    if (!selectedDocument || !zapSignData.signerEmail || !zapSignData.signerName) {
      alert('Preencha todos os campos');
      return;
    }

    try {
      setSendingToZapSign(true);
      const result = await api.sendDocumentToZapSign(
        selectedDocument.id,
        zapSignData.signerEmail,
        zapSignData.signerName
      );

      alert(`Documento enviado para assinatura!\n\nLink: ${result.signLink}`);
      setShowZapSignModal(false);
      fetchDocuments();
    } catch (error) {
      console.error('Failed to send to ZapSign:', error);
      alert('Erro ao enviar para ZapSign. Verifique o console.');
    } finally {
      setSendingToZapSign(false);
    }
  };

  const handleMarkAsSigned = async (id: number) => {
    try {
      await api.markDocumentAsSigned(id, { signedBy: 'Sistema' } as any);
      fetchDocuments();
    } catch (error) {
      console.error('Failed to mark document as signed:', error);
    }
  };

  const handleCheckZapSignStatus = async (id: number) => {
    try {
      const result = await api.checkZapSignStatus(id);
      alert(`Status: ${result.status}\n\nZapSign ID: ${result.zapsignId}`);
      fetchDocuments();
    } catch (error) {
      console.error('Failed to check status:', error);
      alert('Erro ao verificar status');
    }
  };

  const resetForm = () => {
    setSelectedDocument(null);
    setFormData({
      clientId: '',
      caseId: '',
      type: 'contract',
      title: '',
      fileName: '',
      filePath: '',
      fileUrl: '',
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
      draft: 'bg-blue-100 text-blue-800',
      pending_signature: 'bg-yellow-100 text-yellow-800',
      signed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const statusLabels = {
    draft: 'Rascunho',
    pending_signature: 'Aguardando Assinatura',
    signed: 'Assinado',
    rejected: 'Rejeitado',
  };

  const typeLabels = {
    proposal: 'Proposta',
    contract: 'Contrato',
    power_of_attorney: 'Procuração',
    financial_aid_declaration: 'Declaração de Hipossuficiência',
    other: 'Outro',
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Documentos</h2>
            <p className="text-gray-600 mt-1">Gestão de documentos e contratos</p>
          </div>
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 bg-legal-600 text-white px-4 py-2 rounded-lg hover:bg-legal-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Novo Documento
          </button>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col gap-4 p-4">
            <input
              type="text"
              placeholder="Buscar por título, cliente ou arquivo..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
            />
            <div className="grid grid-cols-2 gap-4">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
              >
                <option value="">Todos os Tipos</option>
                <option value="proposal">Proposta</option>
                <option value="contract">Contrato</option>
                <option value="power_of_attorney">Procuração</option>
                <option value="financial_aid_declaration">Declaração de Hipossuficiência</option>
                <option value="other">Outro</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
              >
                <option value="">Todos os Status</option>
                <option value="draft">Rascunho</option>
                <option value="pending_signature">Aguardando Assinatura</option>
                <option value="signed">Assinado</option>
                <option value="rejected">Rejeitado</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader title={`Documentos (${total})`} />
          <CardBody>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : documents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Título
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Tipo
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Arquivo
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
                    {documents.map((doc) => (
                      <tr key={doc.id} className="border-b hover:bg-gray-50 transition">
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                          {doc.title}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {typeLabels[doc.type as keyof typeof typeLabels]}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {doc.fileName ? (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-legal-600 hover:text-legal-700 underline"
                            >
                              {doc.fileName}
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                              doc.status
                            )}`}
                          >
                            {statusLabels[doc.status as keyof typeof statusLabels]}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEdit(doc)}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="Editar"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            {doc.status === 'draft' && (
                              <button
                                onClick={() => handleSendToSignature(doc.id)}
                                className="text-yellow-600 hover:text-yellow-800 transition"
                                title="Enviar para ZapSign"
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                            )}
                            {doc.status === 'pending_signature' && (
                              <button
                                onClick={() => handleCheckZapSignStatus(doc.id)}
                                className="text-orange-600 hover:text-orange-800 transition"
                                title="Verificar Status ZapSign"
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(doc.id)}
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
              <div className="text-center py-8 text-gray-500">Nenhum documento encontrado</div>
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

      {/* ZapSign Modal */}
      <Modal
        isOpen={showZapSignModal}
        title="Enviar para Assinatura (ZapSign)"
        onClose={() => setShowZapSignModal(false)}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email do Assinante
            </label>
            <input
              type="email"
              placeholder="cliente@example.com"
              value={zapSignData.signerEmail}
              onChange={(e) => setZapSignData({ ...zapSignData, signerEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Assinante
            </label>
            <input
              type="text"
              placeholder="Nome Completo"
              value={zapSignData.signerName}
              onChange={(e) => setZapSignData({ ...zapSignData, signerName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
              required
            />
          </div>
          <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
            <p>Documento: <strong>{selectedDocument?.title}</strong></p>
            <p className="mt-1 text-xs">Um link de assinatura será enviado para o email informado.</p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSendToZapSign}
              disabled={sendingToZapSign}
              className="flex-1 px-4 py-2 bg-legal-600 text-white rounded-lg hover:bg-legal-700 disabled:opacity-50 transition"
            >
              {sendingToZapSign ? 'Enviando...' : 'Enviar para ZapSign'}
            </button>
            <button
              onClick={() => setShowZapSignModal(false)}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      {/* Document Form Modal */}
      <Modal
        isOpen={showModal}
        title={selectedDocument ? 'Editar Documento' : 'Novo Documento'}
        onClose={handleCloseModal}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="ID do Cliente (opcional)"
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
            />
            <input
              type="number"
              placeholder="ID do Caso (opcional)"
              value={formData.caseId}
              onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
              required
            >
              <option value="proposal">Proposta</option>
              <option value="contract">Contrato</option>
              <option value="power_of_attorney">Procuração</option>
              <option value="financial_aid_declaration">Declaração de Hipossuficiência</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Título do Documento"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
            required
          />

          <input
            type="text"
            placeholder="Nome do Arquivo"
            value={formData.fileName}
            onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
          />

          <input
            type="text"
            placeholder="Caminho do Arquivo"
            value={formData.filePath}
            onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
          />

          <input
            type="url"
            placeholder="URL do Arquivo"
            value={formData.fileUrl}
            onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legal-500 outline-none"
          />

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-legal-600 text-white rounded-lg hover:bg-legal-700 transition"
            >
              {selectedDocument ? 'Atualizar' : 'Criar'} Documento
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

export default Documents;
