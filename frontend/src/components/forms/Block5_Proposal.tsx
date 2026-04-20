import React, { useState } from 'react';
import { LeadFormState } from '../../hooks/useLeadFormState';

interface Block5Props {
  data: LeadFormState['block5'];
  onUpdate: (data: Partial<LeadFormState['block5']>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Block5_Proposal: React.FC<Block5Props> = ({ data, onUpdate, onNext, onPrev }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateProposal = async () => {
    setIsGenerating(true);
    try {
      // API call to generate proposal would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onUpdate({
        proposalNumber: `PROP-${new Date().getFullYear()}-0001`,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Bloco 5: Proposta</h2>

      {!data.proposalNumber ? (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-gray-700 mb-4">
            A proposta de honorários será gerada automaticamente com base nos dados fornecidos nos blocos anteriores.
          </p>
          <button
            onClick={handleGenerateProposal}
            disabled={isGenerating}
            className={`w-full px-4 py-2 rounded-md font-medium ${
              isGenerating ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isGenerating ? 'Gerando proposta...' : '📄 Gerar Proposta'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">✓ Proposta gerada com sucesso</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Número da Proposta</label>
              <p className="mt-1 px-3 py-2 bg-gray-100 rounded-md text-gray-800">{data.proposalNumber}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Válida até</label>
              <p className="mt-1 px-3 py-2 bg-gray-100 rounded-md text-gray-800">
                {data.validUntil ? new Date(data.validUntil).toLocaleDateString('pt-BR') : '-'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Observações</label>
            <textarea
              value={data.observations || ''}
              onChange={(e) => onUpdate({ observations: e.target.value })}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Observações adicionais sobre a proposta"
            />
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
            <p>
              A proposta completa será exibida no bloco de visualização e poderá ser enviada ao cliente para assinatura
              digital via ZapSign após aceitação no próximo bloco.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onPrev} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
          ← Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!data.proposalNumber}
          className={`px-6 py-2 rounded-md font-medium ${
            data.proposalNumber ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-700 cursor-not-allowed'
          }`}
        >
          Próximo →
        </button>
      </div>
    </div>
  );
};
