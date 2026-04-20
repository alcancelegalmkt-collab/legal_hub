import React, { useState, useEffect } from 'react';
import { XMarkIcon, DocumentArrowDownIcon, EnvelopeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

interface ProposalPreviewProps {
  leadId: number;
  isOpen: boolean;
  onClose: () => void;
  onSendEmail?: (email: string) => void;
  onSendWhatsApp?: (phone: string) => void;
}

const ProposalPreview: React.FC<ProposalPreviewProps> = ({
  leadId,
  isOpen,
  onClose,
  onSendEmail,
  onSendWhatsApp,
}) => {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [proposalNumber, setProposalNumber] = useState<string>('');
  const [showSendOptions, setShowSendOptions] = useState(false);
  const [sendEmail, setSendEmail] = useState('');
  const [sendPhone, setSendPhone] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProposal();
    }
  }, [isOpen, leadId]);

  const loadProposal = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.generateProposalPreview(leadId);
      setHtml(response.html);
      setProposalNumber(response.proposalNumber);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao gerar proposta');
      console.error('Erro ao gerar proposta:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setSending(true);
      const pdfHtml = await api.generateProposalPDF(leadId);
      const link = document.createElement('a');
      link.href = `data:text/html;charset=utf-8,${encodeURIComponent(pdfHtml)}`;
      link.download = `${proposalNumber}.html`;
      link.click();
    } catch (err: any) {
      setError('Erro ao baixar proposta');
      console.error('Erro:', err);
    } finally {
      setSending(false);
    }
  };

  const handleSendEmail = async () => {
    if (!sendEmail) {
      alert('Digite um email');
      return;
    }
    try {
      setSending(true);
      await api.sendProposalByEmail(leadId, sendEmail);
      alert('Proposta enviada por email com sucesso!');
      setSendEmail('');
      setShowSendOptions(false);
      if (onSendEmail) onSendEmail(sendEmail);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao enviar email');
    } finally {
      setSending(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!sendPhone) {
      alert('Digite um número de WhatsApp');
      return;
    }
    try {
      setSending(true);
      await api.sendProposalByWhatsApp(leadId, sendPhone);
      alert('Proposta enviada por WhatsApp com sucesso!');
      setSendPhone('');
      setShowSendOptions(false);
      if (onSendWhatsApp) onSendWhatsApp(sendPhone);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao enviar WhatsApp');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4 bg-gradient-to-r from-purple-50 to-blue-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Proposta de Honorários</h2>
            <p className="text-sm text-gray-600">
              {proposalNumber && `Nº ${proposalNumber}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Actions */}
        <div className="border-b px-4 py-3 flex gap-2 bg-gray-50">
          <button
            onClick={handleDownloadPDF}
            disabled={loading || sending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            Download PDF
          </button>
          <button
            onClick={() => setShowSendOptions(!showSendOptions)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            Enviar Proposta
          </button>
        </div>

        {/* Send Options */}
        {showSendOptions && (
          <div className="border-b px-4 py-3 bg-gray-50 space-y-3">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email do cliente"
                value={sendEmail}
                onChange={(e) => setSendEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleSendEmail}
                disabled={sending || !sendEmail}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <EnvelopeIcon className="w-5 h-5" />
                Enviar Email
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="WhatsApp do cliente (11999999999)"
                value={sendPhone}
                onChange={(e) => setSendPhone(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
              <button
                onClick={handleSendWhatsApp}
                disabled={sending || !sendPhone}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                <ChatBubbleLeftIcon className="w-5 h-5" />
                Enviar WhatsApp
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
                <p className="mt-4 text-gray-600">Gerando proposta...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-medium">Erro ao gerar proposta</p>
                <p className="text-red-600 text-sm mt-2">{error}</p>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-gray-50">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <iframe
                  srcDoc={html}
                  className="w-full border-0"
                  style={{ height: '600px' }}
                  title="Proposta Preview"
                />
              </div>
              <div className="mt-4 text-center text-sm text-gray-600">
                <p>⬆️ Proposta de Honorários - Clique em Download PDF para salvar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalPreview;
