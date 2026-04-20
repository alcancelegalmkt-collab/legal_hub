import React from 'react';
import { HonoraryType } from '../../types';
import { LeadFormState } from '../../hooks/useLeadFormState';

interface Block4Props {
  data: LeadFormState['block4'];
  onUpdate: (data: Partial<LeadFormState['block4']>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Block4_Honorary: React.FC<Block4Props> = ({ data, onUpdate, onNext, onPrev }) => {
  const isComplete = data.honoraryType !== null;

  const renderHonoraryTypeSelection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        onClick={() => onUpdate({ honoraryType: HonoraryType.INITIAL_SUCCESS })}
        className={`p-4 border-2 rounded-lg text-left transition ${
          data.honoraryType === HonoraryType.INITIAL_SUCCESS
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <h3 className="font-bold text-gray-800">Inicial + Sucesso</h3>
        <p className="text-sm text-gray-600">Honorário fixo inicial + percentual sobre o sucesso</p>
      </button>

      <button
        onClick={() => onUpdate({ honoraryType: HonoraryType.UNIQUE })}
        className={`p-4 border-2 rounded-lg text-left transition ${
          data.honoraryType === HonoraryType.UNIQUE ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <h3 className="font-bold text-gray-800">Honorário Único</h3>
        <p className="text-sm text-gray-600">Valor fixo único, independente do resultado</p>
      </button>

      <button
        onClick={() => onUpdate({ honoraryType: HonoraryType.SUCCESS_ONLY })}
        className={`p-4 border-2 rounded-lg text-left transition ${
          data.honoraryType === HonoraryType.SUCCESS_ONLY
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <h3 className="font-bold text-gray-800">Apenas Sucesso</h3>
        <p className="text-sm text-gray-600">Sem honorário inicial, apenas percentual sobre sucesso</p>
      </button>

      <button
        onClick={() => onUpdate({ honoraryType: HonoraryType.MONTHLY })}
        className={`p-4 border-2 rounded-lg text-left transition ${
          data.honoraryType === HonoraryType.MONTHLY
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <h3 className="font-bold text-gray-800">Honorário Mensal</h3>
        <p className="text-sm text-gray-600">Valor recorrente mensal com prazo definido</p>
      </button>
    </div>
  );

  const renderCommonFields = () => (
    <div className="space-y-4 p-4 bg-gray-50 rounded-md border border-gray-200">
      <h3 className="font-semibold text-gray-800">Campos Comuns</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Desconto (%)</label>
          <input
            type="number"
            value={data.discountAmount || 0}
            onChange={(e) => onUpdate({ discountAmount: Number(e.target.value) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Multa por Atraso (%)</label>
          <input
            type="number"
            value={data.penaltyPercentage || 0}
            onChange={(e) => onUpdate({ penaltyPercentage: Number(e.target.value) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Juros Moratórios (%)</label>
          <input
            type="number"
            value={data.delayInterestPercentage || 0}
            onChange={(e) => onUpdate({ delayInterestPercentage: Number(e.target.value) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={data.monetaryCorrection || false}
              onChange={(e) => onUpdate({ monetaryCorrection: e.target.checked })}
              className="mr-2"
            />
            Correção Monetária
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={data.contractualHonorariesIndependent || false}
            onChange={(e) => onUpdate({ contractualHonorariesIndependent: e.target.checked })}
            className="mr-2"
          />
          Honorários contratuais independentes de sucesso
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={data.agreementOnlyWithAdvocate || false}
            onChange={(e) => onUpdate({ agreementOnlyWithAdvocate: e.target.checked })}
            className="mr-2"
          />
          Acordo apenas com advogado (cliente não pode negociar diretamente)
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Observações</label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Informações adicionais sobre a estrutura de honorários"
        />
      </div>
    </div>
  );

  const renderInitialSuccessFields = () => (
    <div className="space-y-4 p-4 bg-blue-50 rounded-md border border-blue-200">
      <h3 className="font-semibold text-gray-800">Honorário Inicial + Sucesso</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Valor Inicial (R$) *</label>
          <input
            type="number"
            value={data.initialValue || 0}
            onChange={(e) => onUpdate({ initialValue: Number(e.target.value) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 1000"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Forma de Pagamento *</label>
          <select
            value={data.initialPaymentMethod || ''}
            onChange={(e) => onUpdate({ initialPaymentMethod: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecione...</option>
            <option value="pix">PIX</option>
            <option value="transferencia">Transferência Bancária</option>
            <option value="boleto">Boleto</option>
            <option value="dinheiro">Dinheiro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Parcelamento (vezes) *</label>
          <input
            type="number"
            value={data.initialInstallments || 1}
            onChange={(e) => onUpdate({ initialInstallments: Number(e.target.value) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            min="1"
            max="12"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Primeira Parcela (data) *</label>
          <input
            type="date"
            value={data.initialFirstDueDate || ''}
            onChange={(e) => onUpdate({ initialFirstDueDate: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Percentual de Sucesso (%)</label>
          <input
            type="number"
            value={data.successPercentage || 0}
            onChange={(e) => onUpdate({ successPercentage: Number(e.target.value) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 20"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Base de Cálculo de Sucesso</label>
          <select
            value={data.successCalculationBase || 'gross'}
            onChange={(e) => onUpdate({ successCalculationBase: e.target.value as 'gross' | 'net' | 'received' })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="gross">Bruto</option>
            <option value="net">Líquido</option>
            <option value="received">Recebido</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Valor Estimado da Causa (R$)</label>
          <input
            type="number"
            value={data.estimatedCauseValue || 0}
            onChange={(e) => onUpdate({ estimatedCauseValue: Number(e.target.value) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 50000"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Momento de Recebimento do Sucesso</label>
          <select
            value={data.successPaymentMoment || ''}
            onChange={(e) => onUpdate({ successPaymentMoment: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecione...</option>
            <option value="agreement">No acordo</option>
            <option value="release">Na liberação</option>
            <option value="received">Quando receber</option>
            <option value="benefit">Ao receber o benefício</option>
            <option value="other">Outro</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderMonthlyFields = () => (
    <div className="space-y-4 p-4 bg-green-50 rounded-md border border-green-200">
      <h3 className="font-semibold text-gray-800">Honorário Mensal</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Valor Mensal (R$) *</label>
          <input
            type="number"
            value={data.monthlyValue || 0}
            onChange={(e) => onUpdate({ monthlyValue: Number(e.target.value) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 500"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Duração do Contrato *</label>
          <select
            value={data.contractDuration || ''}
            onChange={(e) => onUpdate({ contractDuration: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecione...</option>
            <option value="indefinite">Indeterminado</option>
            <option value="3">3 meses</option>
            <option value="6">6 meses</option>
            <option value="12">12 meses</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Bloco 4: Estrutura de Honorários</h2>

      {!data.honoraryType ? (
        <>
          <p className="text-gray-600">Selecione a estrutura de honorários para este case:</p>
          {renderHonoraryTypeSelection()}
        </>
      ) : (
        <>
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-medium">
              Tipo selecionado: <span className="font-bold capitalize">{data.honoraryType.replace(/_/g, ' ')}</span>
            </p>
            <button
              onClick={() => onUpdate({ honoraryType: null })}
              className="mt-2 text-sm text-green-700 hover:text-green-900 underline"
            >
              Mudar tipo
            </button>
          </div>

          {(data.honoraryType === HonoraryType.INITIAL_SUCCESS || data.honoraryType === HonoraryType.SUCCESS_ONLY) &&
            renderInitialSuccessFields()}

          {data.honoraryType === HonoraryType.MONTHLY && renderMonthlyFields()}

          {data.honoraryType === HonoraryType.UNIQUE && (
            <div className="space-y-4 p-4 bg-purple-50 rounded-md border border-purple-200">
              <h3 className="font-semibold text-gray-800">Honorário Único</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Valor Total (R$) *</label>
                <input
                  type="number"
                  value={data.initialValue || 0}
                  onChange={(e) => onUpdate({ initialValue: Number(e.target.value) })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 5000"
                  step="0.01"
                />
              </div>
            </div>
          )}

          {renderCommonFields()}
        </>
      )}

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
