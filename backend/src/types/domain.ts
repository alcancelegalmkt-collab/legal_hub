import {
  HonoraryType,
  SuccessCalculationBase,
  SuccessPaymentMoment,
  FinancialResponsibleType,
  PaymentMethod,
  ProposalStatus,
  AcceptanceMethod,
  PaymentStatus,
  LeadStatus,
  ContractDuration,
} from './enums';

// ============= LEGAL AREA =============
export interface ILegalArea {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============= CASE TYPE =============
export interface ICaseType {
  id: number;
  legalAreaId: number;
  name: string;
  description?: string;
  requiresDependents?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============= LEAD DETAILS =============
export interface ILeadDetails {
  id: number;
  leadId: number;
  clientSummary: string; // resumo da reunião/caso
  clientObjective?: string;
  estimatedCauseValue?: number;
  hasHadPreviousAction?: boolean;
  documentInitials?: string;
  strategicObservations?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============= HONORARY STRUCTURE =============
export interface IHonoraryStructure {
  id: number;
  leadId: number;
  honoraryType: HonoraryType;

  // Para INITIAL_SUCCESS e UNIQUE
  initialValue?: number;
  initialPaymentMethod?: PaymentMethod;
  initialInstallments?: number;
  initialFirstDueDate?: Date;
  initialFixedDay?: number;

  // Para INITIAL_SUCCESS, SUCCESS_ONLY
  successPercentage?: number;
  successCalculationBase?: SuccessCalculationBase;
  successPaymentMoment?: SuccessPaymentMoment;
  successPaymentMomentOther?: string;
  estimatedCauseValue?: number;
  estimatedHonorarySuccess?: number;

  // Para MONTHLY
  monthlyValue?: number;
  contractDuration?: ContractDuration;

  // Comuns a todos
  discountAmount?: number;
  penaltyPercentage?: number; // multa por inadimplência
  delayInterestPercentage?: number; // juros por atraso
  monetaryCorrection?: boolean;
  contractualHonorariesIndependent?: boolean; // independem de sucumbenciais
  agreementOnlyWithAdvocate?: boolean; // acordo precisa anuência
  contractualPenaltyPercentage?: number;
  currency: string; // BRL, USD, etc
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

// ============= PAYMENT PLAN =============
export interface IPaymentPlan {
  id: number;
  honoraryStructureId: number;
  paymentMethod: PaymentMethod;
  installments: number; // número de parcelas
  firstDueDate: Date;
  fixedDay?: number; // dia fixo de vencimento
  createdAt: Date;
  updatedAt: Date;
}

// ============= PAYMENT INSTALLMENT =============
export interface IPaymentInstallment {
  id: number;
  paymentPlanId: number;
  installmentNumber: number;
  dueDate: Date;
  amount: number;
  status: PaymentStatus;
  paidAt?: Date;
  paidMethod?: PaymentMethod;
  receiptUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============= FINANCIAL RESPONSIBLE =============
export interface IFinancialResponsible {
  id: number;
  leadId?: number;
  clientId?: number;
  responsibleType: FinancialResponsibleType;
  name: string;
  cpf: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============= PROPOSAL =============
export interface IProposal {
  id: number;
  leadId: number;
  proposalNumber: string; // PROP-YYYY-NNNN
  generatedAt: Date;
  validUntil: Date;
  status: ProposalStatus;
  htmlContent: string; // HTML da proposta
  pdfUrl?: string; // URL do PDF gerado
  responsibleUserId: number;
  observations?: string;
  sharedLinks?: IProposalShareLink[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProposalShareLink {
  link: string;
  expiresAt: Date;
  accessCount?: number;
}

// ============= PROPOSAL ACCEPTANCE =============
export interface IProposalAcceptance {
  id: number;
  proposalId: number;
  acceptedAt: Date;
  acceptanceMethod: AcceptanceMethod;
  zapsignDocumentId?: string;
  zapsignSignLink?: string;
  signedPdfUrl?: string;
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============= FINANCIAL RECORD =============
export interface IFinancialRecord {
  id: number;
  clientId: number;
  leadId?: number;
  proposalAcceptanceId: number;
  totalValue: number;
  paidValue: number;
  pendingValue: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============= CONTRACT TEMPLATE =============
export interface IContractTemplate {
  id: number;
  legalAreaId: number;
  caseTypeId?: number; // null = template genérico da área
  name: string;
  htmlTemplate: string;
  defaultClauses?: IContractClause[];
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContractClause {
  id?: string;
  title: string;
  content: string;
  order: number;
  isRequired: boolean;
}

// ============= GENERATED CONTRACT =============
export interface IGeneratedContract {
  id: number;
  clientId: number;
  leadId: number;
  contractTemplateId: number;
  htmlContent: string;
  pdfUrl?: string;
  status: 'draft' | 'pending_signature' | 'signed' | 'rejected';
  zapsignDocumentId?: string;
  zapsignSignLink?: string;
  signedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============= REFACTORED LEAD =============
export interface ILeadRefactored {
  id: number;
  userId: number; // advogado responsável
  legalAreaId: number;
  caseTypeId: number;
  clientId?: number; // quando convertido
  status: LeadStatus;
  proposalId?: number;
  proposalAcceptanceId?: number;
  financialRecordId?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============= REFACTORED CLIENT =============
export interface IClientRefactored {
  id: number;
  leadId?: number; // rastreabilidade
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  whatsapp: string;
  maritalStatus?: string;
  profession?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  rg?: string;
  nationality?: string;
  needsFinancialAid?: boolean;
  primaryLawyerId: number;
  financialResponsibleId?: number; // responsável pelo pagamento
  createdAt: Date;
  updatedAt: Date;
}
