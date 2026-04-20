import React from 'react';
import { LeadFormState } from '../../hooks/useLeadFormState';

interface Block7Props {
  data: LeadFormState['block7'];
  onUpdate: (data: Partial<LeadFormState['block7']>) => void;
  onSubmit: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
}

export const Block7_Financial: React.FC<Block7Props> = ({ data, onUpdate, onSubmit, onPrev, isSubmitting }) => {
  const isComplete = data.totalValue > 0;

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Bloco 7: Registro Financeiro</h2>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
        <p>
          Este registro financeiro será utilizado para acompanhamento de pagamentos e integração com o sistema
          contábil. Os valores são calculados automaticamente a partir da estrutura de honorários definida.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Valor Total a Receber (R$) *</label>
          <input
            type="number"
            value={data.totalValue || 0}
            onChange={(e) => onUpdate({ totalValue: Number(e.target.value) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 5000"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Valor Já Recebido (R$)</label>
          <input
            type="number"
            value={data.paidValue || 0}
            onChange={(e) => onUpdate({ paidValue: Number(e.target.value) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 0"
            step="0.01"
          />
        </div>

        <div className="p-4 bg-gray-100 rounded-md">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-800">Valor Pendente:</span>
            <span className="text-xl font-bold text-red-600">R$ {(data.totalValue - data.paidValue).toFixed(2)}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Observações</label>
          <textarea
            value={data.notes || ''}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Observações adicionais sobre o registro financeiro"
          />
        </div>
      </div>

      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="font-semibold text-yellow-800 mb-2">Resumo do Cadastro</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>✓ Dados do solicitante preenchidos</li>
          <li>✓ Caso categorizado e descrito</li>
          <li>✓ Honorários estruturados</li>
          <li>✓ Proposta gerada</li>
          <li>✓ Aceitação registrada</li>
          <li>✓ Registro financeiro criado</li>
        </ul>
        <p className="text-sm text-yellow-800 mt-3">
          Após submissão, o lead será convertido em cliente e será possível acompanhar o progresso através do Trello e
          da plataforma.
        </p>
      </div>

      <div className="flex justify-between">
        <button onClick={onPrev} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
          ← Voltar
        </button>
        <button
          onClick={onSubmit}
          disabled={!isComplete || isSubmitting}
          className={`px-6 py-2 rounded-md font-medium ${
            isComplete && !isSubmitting
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-700 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Salvando...' : '✓ Finalizar Cadastro'}
        </button>
      </div>
    </div>
  );
};
