import React, { useState } from 'react';
import { useLeadFormState, LeadFormState } from '../../hooks/useLeadFormState';
import { Block1_LeadData } from './Block1_LeadData';
import { Block2_CaseData } from './Block2_CaseData';
import { Block3_Dependents } from './Block3_Dependents';
import { Block4_Honorary } from './Block4_Honorary';
import { Block5_Proposal } from './Block5_Proposal';
import { Block6_Acceptance } from './Block6_Acceptance';
import { Block7_Financial } from './Block7_Financial';
import api from '../../services/api';

interface CaseType {
  id: number;
  requiresDependents?: boolean;
}

export const LeadFormMultiStep: React.FC = () => {
  const {
    state,
    updateBlock1,
    updateBlock2,
    updateBlock3,
    addDependent,
    removeDependent,
    updateBlock4,
    updateBlock5,
    updateBlock6,
    updateBlock7,
    setCurrentBlock,
    resetForm,
  } = useLeadFormState();

  const [selectedCaseType, setSelectedCaseType] = useState<CaseType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleNext = () => {
    if (state.currentBlock < 7) {
      setCurrentBlock(state.currentBlock + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (state.currentBlock > 1) {
      setCurrentBlock(state.currentBlock - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        // Block 1: Responsavel
        responsavel: {
          nomeCompleto: state.block1.nomeCompleto,
          cpf: state.block1.cpf,
          email: state.block1.email,
          telefone: state.block1.telefone,
          endereco: state.block1.endereco,
          cidade: state.block1.cidade,
          estado: state.block1.estado,
          cep: state.block1.cep,
        },

        // Block 2: LeadDetails
        leadDetails: {
          clientSummary: state.block2.resumoCaso,
          clientObjective: state.block2.objetivoCliente,
          legalAreaId: state.block2.legalAreaId,
          caseTypeId: state.block2.caseTypeId,
        },

        // Block 3: Dependents
        dependentes: state.block3.dependentes,

        // Block 4: HonoraryStructure
        honoraryStructure: {
          ...state.block4,
        },

        // Block 5: Proposal
        proposal: {
          observations: state.block5.observations,
        },

        // Block 6: Acceptance
        acceptance: {
          acceptanceMethod: state.block6.acceptanceMethod,
          acceptedAt: state.block6.acceptedAt,
          observations: state.block6.observations,
        },

        // Block 7: Financial Record
        financialRecord: {
          totalValue: state.block7.totalValue,
          paidValue: state.block7.paidValue,
          notes: state.block7.notes,
        },
      };

      const response = await api.post('/leads/complete', payload);

      setSubmitSuccess(true);
      setTimeout(() => {
        resetForm();
        setSubmitSuccess(false);
        window.location.href = '/leads';
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao submeter formulário:', error);
      setSubmitError(error.response?.data?.error || 'Erro ao submeter o formulário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showDependents = selectedCaseType?.requiresDependents === true;

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <button
              key={step}
              onClick={() => setCurrentBlock(step)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                step === state.currentBlock
                  ? 'bg-blue-600 text-white'
                  : step < state.currentBlock
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-700'
              }`}
            >
              {step < state.currentBlock ? '✓' : step}
            </button>
          ))}
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(state.currentBlock / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Error message */}
      {submitError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          <p className="font-semibold">Erro ao submeter</p>
          <p className="text-sm">{submitError}</p>
        </div>
      )}

      {/* Success message */}
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
          <p className="font-semibold">✓ Cadastro realizado com sucesso!</p>
          <p className="text-sm">Redirecionando...</p>
        </div>
      )}

      {/* Form blocks */}
      {state.currentBlock === 1 && <Block1_LeadData data={state.block1} onUpdate={updateBlock1} onNext={handleNext} />}

      {state.currentBlock === 2 && (
        <Block2_CaseData
          data={state.block2}
          onUpdate={updateBlock2}
          onNext={handleNext}
          onPrev={handlePrev}
          onCaseTypeSelected={setSelectedCaseType}
        />
      )}

      {state.currentBlock === 3 && (
        <Block3_Dependents
          data={state.block3}
          onUpdate={updateBlock3}
          addDependent={addDependent}
          removeDependent={removeDependent}
          onNext={handleNext}
          onPrev={handlePrev}
          showDependents={showDependents}
        />
      )}

      {state.currentBlock === 4 && (
        <Block4_Honorary data={state.block4} onUpdate={updateBlock4} onNext={handleNext} onPrev={handlePrev} />
      )}

      {state.currentBlock === 5 && (
        <Block5_Proposal data={state.block5} onUpdate={updateBlock5} onNext={handleNext} onPrev={handlePrev} />
      )}

      {state.currentBlock === 6 && (
        <Block6_Acceptance data={state.block6} onUpdate={updateBlock6} onNext={handleNext} onPrev={handlePrev} />
      )}

      {state.currentBlock === 7 && (
        <Block7_Financial
          data={state.block7}
          onUpdate={updateBlock7}
          onSubmit={handleSubmit}
          onPrev={handlePrev}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
