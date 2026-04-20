import { useState, useCallback } from 'react';
import { HonoraryType } from '../types';

export interface LeadFormState {
  // Block 1: Lead Data
  block1: {
    nomeCompleto: string;
    cpf: string;
    email: string;
    telefone: string;
    whatsapp: string;
    endereco: string;
    cidade: string;
    estado: string;
    cep: string;
  };

  // Block 2: Case Data
  block2: {
    legalAreaId: number | null;
    caseTypeId: number | null;
    tipoDemanda: string;
    resumoCaso: string;
    objetivoCliente: string;
  };

  // Block 3: Dependents (conditional on caseType.requiresDependents)
  block3: {
    possuiDependente: boolean;
    dependentes: Array<{
      id?: string;
      nomeCompleto: string;
      dataNascimento: string;
      cpf?: string;
      parentesco: string;
      condicaoEspecifica?: string;
    }>;
  };

  // Block 4: Honorary Structure
  block4: {
    honoraryType: HonoraryType | null;
    // INITIAL_SUCCESS + SUCCESS_ONLY fields
    initialValue?: number;
    initialPaymentMethod?: string;
    initialInstallments?: number;
    initialFirstDueDate?: string;
    initialFixedDay?: number;
    successPercentage?: number;
    successCalculationBase?: 'gross' | 'net' | 'received';
    successPaymentMoment?: string;
    estimatedCauseValue?: number;
    // MONTHLY fields
    monthlyValue?: number;
    contractDuration?: string;
    // Common fields
    discountAmount?: number;
    penaltyPercentage?: number;
    delayInterestPercentage?: number;
    monetaryCorrection?: boolean;
    contractualHonorariesIndependent?: boolean;
    agreementOnlyWithAdvocate?: boolean;
    notes?: string;
  };

  // Block 5: Proposal (read-only preview)
  block5: {
    proposalNumber?: string;
    validUntil?: string;
    observations?: string;
  };

  // Block 6: Acceptance
  block6: {
    acceptanceMethod?: 'digital' | 'email' | 'phone' | 'in_person';
    acceptedAt?: string;
    observations?: string;
  };

  // Block 7: Financial Record
  block7: {
    totalValue: number;
    paidValue: number;
    notes?: string;
  };

  currentBlock: number;
  calculatedValues?: {
    estimatedSuccess?: number;
    totalWithSuccessFee?: number;
    installmentAmount?: number;
  };
}

const initialState: LeadFormState = {
  block1: {
    nomeCompleto: '',
    cpf: '',
    email: '',
    telefone: '',
    whatsapp: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
  },
  block2: {
    legalAreaId: null,
    caseTypeId: null,
    tipoDemanda: '',
    resumoCaso: '',
    objetivoCliente: '',
  },
  block3: {
    possuiDependente: false,
    dependentes: [],
  },
  block4: {
    honoraryType: null,
  },
  block5: {},
  block6: {},
  block7: {
    totalValue: 0,
    paidValue: 0,
  },
  currentBlock: 1,
};

export const useLeadFormState = () => {
  const [state, setState] = useState<LeadFormState>(initialState);

  const updateBlock1 = useCallback((data: Partial<LeadFormState['block1']>) => {
    setState((prev) => ({
      ...prev,
      block1: { ...prev.block1, ...data },
    }));
  }, []);

  const updateBlock2 = useCallback((data: Partial<LeadFormState['block2']>) => {
    setState((prev) => ({
      ...prev,
      block2: { ...prev.block2, ...data },
    }));
  }, []);

  const updateBlock3 = useCallback((data: Partial<LeadFormState['block3']>) => {
    setState((prev) => ({
      ...prev,
      block3: { ...prev.block3, ...data },
    }));
  }, []);

  const addDependent = useCallback((dependent: LeadFormState['block3']['dependentes'][0]) => {
    setState((prev) => ({
      ...prev,
      block3: {
        ...prev.block3,
        dependentes: [...prev.block3.dependentes, { id: Date.now().toString(), ...dependent }],
      },
    }));
  }, []);

  const removeDependent = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      block3: {
        ...prev.block3,
        dependentes: prev.block3.dependentes.filter((d) => d.id !== id),
      },
    }));
  }, []);

  const updateBlock4 = useCallback((data: Partial<LeadFormState['block4']>) => {
    setState((prev) => ({
      ...prev,
      block4: { ...prev.block4, ...data },
    }));
  }, []);

  const updateBlock5 = useCallback((data: Partial<LeadFormState['block5']>) => {
    setState((prev) => ({
      ...prev,
      block5: { ...prev.block5, ...data },
    }));
  }, []);

  const updateBlock6 = useCallback((data: Partial<LeadFormState['block6']>) => {
    setState((prev) => ({
      ...prev,
      block6: { ...prev.block6, ...data },
    }));
  }, []);

  const updateBlock7 = useCallback((data: Partial<LeadFormState['block7']>) => {
    setState((prev) => ({
      ...prev,
      block7: { ...prev.block7, ...data },
    }));
  }, []);

  const setCurrentBlock = useCallback((block: number) => {
    setState((prev) => ({
      ...prev,
      currentBlock: block,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setState(initialState);
  }, []);

  return {
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
  };
};
