import React from 'react';
import { LeadFormState } from '../../hooks/useLeadFormState';

interface Block1Props {
  data: LeadFormState['block1'];
  onUpdate: (data: Partial<LeadFormState['block1']>) => void;
  onNext: () => void;
}

export const Block1_LeadData: React.FC<Block1Props> = ({ data, onUpdate, onNext }) => {
  const isComplete =
    data.nomeCompleto && data.cpf && data.email && data.telefone && data.endereco && data.cidade && data.estado && data.cep;

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Bloco 1: Dados do Solicitante</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome Completo *</label>
          <input
            type="text"
            value={data.nomeCompleto}
            onChange={(e) => onUpdate({ nomeCompleto: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: João Silva Santos"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CPF *</label>
          <input
            type="text"
            value={data.cpf}
            onChange={(e) => onUpdate({ cpf: e.target.value.replace(/\D/g, '').slice(0, 11) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 12345678901"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email *</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: joao@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Telefone *</label>
          <input
            type="tel"
            value={data.telefone}
            onChange={(e) => onUpdate({ telefone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 11999999999"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
          <input
            type="tel"
            value={data.whatsapp}
            onChange={(e) => onUpdate({ whatsapp: e.target.value.replace(/\D/g, '').slice(0, 11) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 11999999999"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CEP *</label>
          <input
            type="text"
            value={data.cep}
            onChange={(e) => onUpdate({ cep: e.target.value.replace(/\D/g, '').slice(0, 8) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 01311100"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Endereço *</label>
          <input
            type="text"
            value={data.endereco}
            onChange={(e) => onUpdate({ endereco: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Av. Paulista, 1000, Apto 101"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cidade *</label>
          <input
            type="text"
            value={data.cidade}
            onChange={(e) => onUpdate({ cidade: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: São Paulo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Estado (UF) *</label>
          <select
            value={data.estado}
            onChange={(e) => onUpdate({ estado: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecione...</option>
            <option value="SP">SP</option>
            <option value="RJ">RJ</option>
            <option value="MG">MG</option>
            <option value="BA">BA</option>
            <option value="RS">RS</option>
            <option value="PR">PR</option>
            <option value="SC">SC</option>
            <option value="GO">GO</option>
            <option value="DF">DF</option>
            <option value="ES">ES</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          disabled
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md cursor-not-allowed"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!isComplete}
          className={`px-6 py-2 rounded-md font-medium ${
            isComplete ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-700 cursor-not-allowed'
          }`}
        >
          Próximo →
        </button>
      </div>
    </div>
  );
};
