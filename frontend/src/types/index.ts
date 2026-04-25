export enum HonoraryType {
  INITIAL_SUCCESS = 'initial_success',
  UNIQUE = 'unique',
  SUCCESS_ONLY = 'success_only',
  MONTHLY = 'monthly',
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'lawyer' | 'assistant';
  oabNumber: string;
}

export interface Responsavel {
  id: number;
  leadId: number;
  nomeCompleto: string;
  cpf: string | null;
  rg: string | null;
  dataNascimento: string | null;
  estadoCivil: string | null;
  profissao: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  relacaoComDependente: string | null;
  nacionalidade: string | null;
  nomeMae: string | null;
  nomePai: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Dependente {
  id: number;
  leadId: number;
  nomeCompleto: string;
  cpf: string | null;
  rgOuCertidao: string | null;
  dataNascimento: string | null;
  idade: number | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  condicaoEspecifica: string | null;
  parentesco: string | null;
  nis: string | null;
  numeroBeneficio: string | null;
  deficienciaOuCondicaoSaude: string | null;
  observacoesDocumentais: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: number;
  legalArea: string;
  tipoDemanda: string;
  resumoCaso: string;
  objetivoCliente: string;
  urgency: 'low' | 'medium' | 'high';
  observacoesEstrategicas: string | null;
  possuiDependente: boolean;
  status: 'new' | 'contacted' | 'qualified' | 'proposal_generated' | 'proposal_sent' | 'closed' | 'lost' | 'converted';
  propostaStatus: string | null;
  propostaPdfUrl: string | null;
  propostaPdfNome: string | null;
  propostaEnviadaEm: string | null;
  propostaEnviadaPor: string | null;
  valorProposto: number | null;
  formaPagamento: string | null;
  vencimentoProposta: string | null;
  entrada: number | null;
  parcelamento: number | null;
  honorariosExito: number | null;
  assignedToId: number | null;
  createdAt: string;
  updatedAt: string;
  assignedTo?: User;
  responsavel?: Responsavel;
  dependentes?: Dependente[];
  // Legacy fields for compatibility
  name?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  description?: string;
  estimatedBudget?: number | null;
  source?: 'whatsapp' | 'phone' | 'email' | 'website' | 'referral';
  aiQualificationScore?: number;
  notes?: string;
}

export interface Client {
  id: number;
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  whatsapp: string;
  maritalStatus: string;
  profession: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  rg: string;
  nationality: string;
  needsFinancialAid: boolean;
  primaryLawyerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Case {
  id: number;
  clientId: number;
  primaryLawyerId: number;
  title: string;
  legalArea: string;
  description: string;
  caseNumber: string;
  court: string;
  caseValue: number | null;
  honorariesFee: number;
  honorariesFeeType: 'fixed' | 'percentage' | 'hourly';
  status: 'active' | 'closed' | 'suspended' | 'archived';
  startDate: string;
  endDate: string | null;
  opposingParties: string;
  processNumber?: string;
  escavadorData?: string;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  lawyer?: User;
}

export interface Document {
  id: number;
  clientId: number;
  caseId: number | null;
  type: 'proposal' | 'contract' | 'power_of_attorney' | 'financial_aid_declaration' | 'other';
  title: string;
  fileName: string;
  filePath: string;
  fileUrl: string | null;
  status: 'draft' | 'pending_signature' | 'signed' | 'rejected';
  zapsignId: string | null;
  zapsignSignLink: string | null;
  signedAt: string | null;
  signedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Movimentacao {
  id: number;
  caseId: number;
  caseName: string;
  processNumber: string;
  movimentationType: string;
  description: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: string;
  createdAt: string;
  updatedAt: string;
  case?: Case;
}


export interface WhatsAppTag {
  id: number;
  name: string;
  color: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppMessage {
  id: number;
  conversationId: number;
  direction: 'incoming' | 'outgoing';
  messageType: 'text' | 'image' | 'document' | 'audio' | 'template' | 'interactive';
  content: string;
  mediaUrl?: string | null;
  externalMessageId?: string | null;
  sentAt: string;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppInternalNote {
  id: number;
  conversationId: number;
  userId: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppConversation {
  id: number;
  contactName: string;
  phoneNumber: string;
  clientId?: number | null;
  leadId?: number | null;
  assignedUserId?: number | null;
  status: 'open' | 'waiting_client' | 'waiting_internal' | 'closed';
  origin?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  nextActionAt?: string | null;
  pipelineStage:
    | 'novo_lead'
    | 'primeiro_atendimento'
    | 'dados_coletados'
    | 'analise_juridica'
    | 'proposta_enviada'
    | 'negociacao'
    | 'contrato_enviado'
    | 'contrato_assinado'
    | 'cliente_ativo'
    | 'encerrado';
  internalSummary?: string | null;
  assignedUser?: Pick<User, 'id' | 'name' | 'email'>;
  tags?: WhatsAppTag[];
  messages?: WhatsAppMessage[];
  internalNotes?: WhatsAppInternalNote[];
  createdAt: string;
  updatedAt: string;
}
