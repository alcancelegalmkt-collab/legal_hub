import React from 'react';
import { LeadFormState } from '../../hooks/useLeadFormState';

interface Block6Props {
  data: LeadFormState['block6'];
  onUpdate: (data: Partial<LeadFormState['block6']>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Block6_Acceptance: React.FC<Block6Props> = ({ data, onUpdate, onNext, onPrev }) => {
  const isComplete = data.acceptanceMethod && data.acceptedAt;

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Bloco 6: Aceitação da Proposta</h2>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
        <p>
          A aceitação da proposta é um marco importante: ela dispara automaticamente a conversão do lead em cliente e
          gera o registro financeiro para acompanhamento.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Data de Aceitação *</label>
          <input
            type="date"
            value={data.acceptedAt || ''}
            onChange={(e) => onUpdate({ acceptedAt: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Método de Aceitação *</label>
          <select
            value={data.acceptanceMethod || ''}
            onChange={(e) => onUpdate({ acceptanceMethod: e.target.value as any })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecione...</option>
            <option value="digital">Assinatura Digital (ZapSign)</option>
            <option value="email">Email</option>
            <option value="phone">Telefone</option>
            <option value="in_person">Presencialmente</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Observações</label>
          <textarea
            value={data.observations || ''}
            onChange={(e) => onUpdate({ observations: e.target.value })}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Observações adicionais sobre a aceitação"
          />
        </div>

        {data.acceptanceMethod === 'digital' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">
              ✓ Será enviado para assinatura digital via ZapSign após conclusão do cadastro
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button onClick={onPrev} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
          ← Voltar
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
