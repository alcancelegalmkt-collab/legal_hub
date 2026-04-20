export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'lawyer' | 'assistant';
  oabNumber: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  legalArea: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedBudget: number | null;
  source: 'whatsapp' | 'phone' | 'email' | 'website' | 'referral';
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'converted';
  aiQualificationScore: number;
  assignedToId: number | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: User;
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
