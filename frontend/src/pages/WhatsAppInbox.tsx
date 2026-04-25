import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { WhatsAppConversation, WhatsAppMessage, WhatsAppInternalNote } from '../types';

const statusLabels: Record<WhatsAppConversation['status'], string> = {
  open: 'Aberto',
  waiting_client: 'Aguardando cliente',
  waiting_internal: 'Aguardando equipe',
  closed: 'Encerrado',
};

const pipelineLabels: Record<WhatsAppConversation['pipelineStage'], string> = {
  novo_lead: 'Novo lead',
  primeiro_atendimento: 'Primeiro atendimento',
  dados_coletados: 'Dados coletados',
  analise_juridica: 'Análise jurídica',
  proposta_enviada: 'Proposta enviada',
  negociacao: 'Negociação',
  contrato_enviado: 'Contrato enviado',
  contrato_assinado: 'Contrato assinado',
  cliente_ativo: 'Cliente ativo',
  encerrado: 'Encerrado',
};

const WhatsAppInbox: React.FC = () => {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [notes, setNotes] = useState<WhatsAppInternalNote[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | WhatsAppConversation['status']>('');
  const [newMessage, setNewMessage] = useState('');
  const [newNote, setNewNote] = useState('');

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId]
  );

  const loadConversations = async () => {
    const data = await api.getWhatsAppConversations({
      search: search || undefined,
      status: statusFilter || undefined,
    });
    setConversations(data.conversations);

    if (!selectedConversationId && data.conversations.length > 0) {
      setSelectedConversationId(data.conversations[0].id);
    }
  };

  const loadConversationDetails = async (conversationId: number) => {
    const data = await api.getWhatsAppConversationById(conversationId);
    setMessages(data.conversation.messages ?? []);
    setNotes(data.conversation.internalNotes ?? []);
  };

  useEffect(() => {
    loadConversations().catch(() => setConversations([]));
  }, [search, statusFilter]);

  useEffect(() => {
    if (selectedConversationId) {
      loadConversationDetails(selectedConversationId).catch(() => {
        setMessages([]);
        setNotes([]);
      });
    }
  }, [selectedConversationId]);

  const handleSendMessage = async () => {
    if (!selectedConversationId || !newMessage.trim()) {
      return;
    }

    await api.sendWhatsAppInboxMessage(selectedConversationId, { content: newMessage.trim() });
    setNewMessage('');
    await loadConversationDetails(selectedConversationId);
    await loadConversations();
  };

  const handleAddNote = async () => {
    if (!selectedConversationId || !newNote.trim()) {
      return;
    }

    await api.addWhatsAppInternalNote(selectedConversationId, { note: newNote.trim() });
    setNewNote('');
    await loadConversationDetails(selectedConversationId);
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp / Atendimento</h1>
            <p className="text-sm text-gray-600">Inbox unificada com histórico, notas internas e funil de atendimento.</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 h-[72vh]">
          <section className="col-span-3 bg-white border rounded-lg flex flex-col">
            <div className="p-3 border-b space-y-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar nome ou telefone"
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as '' | WhatsAppConversation['status'])}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">Todos os status</option>
                <option value="open">Aberto</option>
                <option value="waiting_client">Aguardando cliente</option>
                <option value="waiting_internal">Aguardando equipe</option>
                <option value="closed">Encerrado</option>
              </select>
            </div>

            <div className="overflow-y-auto">
              {conversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`w-full text-left px-3 py-3 border-b hover:bg-gray-50 ${
                    selectedConversationId === conversation.id ? 'bg-emerald-50' : ''
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-900">{conversation.contactName}</p>
                  <p className="text-xs text-gray-600">{conversation.phoneNumber}</p>
                  <p className="text-xs text-gray-500 truncate mt-1">{conversation.lastMessage ?? 'Sem mensagens ainda'}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="col-span-6 bg-white border rounded-lg flex flex-col">
            <div className="p-3 border-b">
              <p className="font-semibold text-gray-900">{selectedConversation?.contactName ?? 'Selecione uma conversa'}</p>
              <p className="text-xs text-gray-600">{selectedConversation?.phoneNumber ?? '-'}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`max-w-[75%] ${message.direction === 'outgoing' ? 'ml-auto' : 'mr-auto'}`}>
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.direction === 'outgoing' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.content}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">{new Date(message.sentAt).toLocaleString('pt-BR')}</p>
                </div>
              ))}
            </div>

            <div className="p-3 border-t flex gap-2">
              <input
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                placeholder="Escreva uma mensagem"
                className="flex-1 border rounded px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  handleSendMessage().catch(() => undefined);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded text-sm"
              >
                Enviar
              </button>
            </div>
          </section>

          <section className="col-span-3 bg-white border rounded-lg flex flex-col">
            <div className="p-3 border-b">
              <h2 className="font-semibold text-gray-900">Detalhes e notas internas</h2>
            </div>

            <div className="p-3 border-b space-y-2 text-sm">
              <p>
                <span className="font-medium">Status:</span>{' '}
                {selectedConversation ? statusLabels[selectedConversation.status] : '-'}
              </p>
              <p>
                <span className="font-medium">Funil:</span>{' '}
                {selectedConversation ? pipelineLabels[selectedConversation.pipelineStage] : '-'}
              </p>
              <p>
                <span className="font-medium">Responsável:</span>{' '}
                {selectedConversation?.assignedUser?.name ?? 'Não atribuído'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notes.map((note) => (
                <div key={note.id} className="bg-yellow-50 border border-yellow-100 rounded p-2">
                  <p className="text-xs text-gray-700">{note.note}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{new Date(note.createdAt).toLocaleString('pt-BR')}</p>
                </div>
              ))}
            </div>

            <div className="p-3 border-t space-y-2">
              <textarea
                value={newNote}
                onChange={(event) => setNewNote(event.target.value)}
                rows={3}
                placeholder="Adicionar comentário interno"
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  handleAddNote().catch(() => undefined);
                }}
                className="w-full px-3 py-2 bg-gray-900 text-white rounded text-sm"
              >
                Salvar nota
              </button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default WhatsAppInbox;
