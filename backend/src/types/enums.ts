// Enums para toda a aplicação

export enum HonoraryType {
  INITIAL_SUCCESS = 'initial_success',
  UNIQUE = 'unique',
  SUCCESS_ONLY = 'success_only',
  MONTHLY = 'monthly',
}

export enum SuccessCalculationBase {
  GROSS = 'gross',
  NET = 'net',
  RECEIVED = 'received',
}

export enum SuccessPaymentMoment {
  AGREEMENT = 'agreement',
  RELEASE = 'release',
  RECEIVED = 'received',
  BENEFIT = 'benefit',
  OTHER = 'other',
}

export enum FinancialResponsibleType {
  CLIENT = 'client',
  THIRD_PARTY = 'third_party',
  DEPENDENT_LINKED = 'dependent_linked',
}

export enum PaymentMethod {
  PIX = 'pix',
  BANK_TRANSFER = 'bank_transfer',
  BOLETO = 'boleto',
  CREDIT_CARD = 'credit_card',
  CASH = 'cash',
  CHECK = 'check',
}

export enum ProposalStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum AcceptanceMethod {
  DIGITAL = 'digital',
  EMAIL = 'email',
  PHONE = 'phone',
  IN_PERSON = 'in_person',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIALLY_PAID = 'partially_paid',
  CANCELLED = 'cancelled',
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL_GENERATED = 'proposal_generated',
  PROPOSAL_SENT = 'proposal_sent',
  CLOSED = 'closed',
  LOST = 'lost',
  CONVERTED = 'converted',
}

export enum ContractDuration {
  INDEFINITE = 'indefinite',
  THREE_MONTHS = '3',
  SIX_MONTHS = '6',
  TWELVE_MONTHS = '12',
}
