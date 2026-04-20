import axios, { AxiosInstance } from 'axios';
import { AuthResponse, Lead, LeadsResponse, Client, Case, Document } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Adicionar token aos headers
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ===== Auth =====
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.api.post('/auth/login', { email, password });
    return data;
  }

  async register(name: string, email: string, password: string, oabNumber: string, role: string): Promise<AuthResponse> {
    const { data } = await this.api.post('/auth/register', {
      name,
      email,
      password,
      oabNumber,
      role,
    });
    return data;
  }

  async getProfile() {
    const { data } = await this.api.get('/auth/profile');
    return data;
  }

  // ===== Leads =====
  async createLead(lead: Partial<Lead>): Promise<Lead> {
    const { data } = await this.api.post('/leads', lead);
    return data;
  }

  async getLeads(
    page: number = 1,
    limit: number = 20,
    status?: string,
    legalArea?: string
  ): Promise<LeadsResponse> {
    const { data } = await this.api.get('/leads', {
      params: { page, limit, status, legalArea },
    });
    return data;
  }

  async getLeadById(id: number): Promise<Lead> {
    const { data } = await this.api.get(`/leads/${id}`);
    return data;
  }

  async updateLead(id: number, updates: Partial<Lead>): Promise<Lead> {
    const { data } = await this.api.put(`/leads/${id}`, updates);
    return data;
  }

  async convertLeadToClient(id: number, clientData: Partial<Client>): Promise<{ message: string; client: Client }> {
    const { data } = await this.api.post(`/leads/${id}/convert-to-client`, clientData);
    return data;
  }

  // ===== Clients =====
  async createClient(client: Partial<Client>): Promise<Client> {
    const { data } = await this.api.post('/clients', client);
    return data;
  }

  async getClients(
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<{ clients: Client[]; total: number }> {
    const { data } = await this.api.get('/clients', {
      params: { page, limit, search },
    });
    return data;
  }

  async getClientById(id: number): Promise<Client> {
    const { data } = await this.api.get(`/clients/${id}`);
    return data;
  }

  async updateClient(id: number, updates: Partial<Client>): Promise<Client> {
    const { data } = await this.api.put(`/clients/${id}`, updates);
    return data;
  }

  async deleteClient(id: number): Promise<void> {
    await this.api.delete(`/clients/${id}`);
  }

  // ===== Cases =====
  async createCase(caseData: Partial<Case>): Promise<Case> {
    const { data } = await this.api.post('/cases', caseData);
    return data;
  }

  async getCases(
    page: number = 1,
    limit: number = 20,
    filters?: { search?: string; status?: string; clientId?: number }
  ): Promise<{ cases: Case[]; total: number }> {
    const { data } = await this.api.get('/cases', {
      params: { page, limit, ...filters },
    });
    return data;
  }

  async getCaseById(id: number): Promise<Case> {
    const { data } = await this.api.get(`/cases/${id}`);
    return data;
  }

  async updateCase(id: number, updates: Partial<Case>): Promise<Case> {
    const { data } = await this.api.put(`/cases/${id}`, updates);
    return data;
  }

  async deleteCase(id: number): Promise<void> {
    await this.api.delete(`/cases/${id}`);
  }

  // ===== Documents =====
  async createDocument(doc: Partial<Document>): Promise<Document> {
    const { data } = await this.api.post('/documents', doc);
    return data;
  }

  async getDocuments(
    page: number = 1,
    limit: number = 20,
    filters?: { search?: string; type?: string; status?: string; clientId?: number; caseId?: number }
  ): Promise<{ documents: Document[]; total: number }> {
    const { data } = await this.api.get('/documents', {
      params: { page, limit, ...filters },
    });
    return data;
  }

  async getDocumentById(id: number): Promise<Document> {
    const { data } = await this.api.get(`/documents/${id}`);
    return data;
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document> {
    const { data } = await this.api.put(`/documents/${id}`, updates);
    return data;
  }

  async deleteDocument(id: number): Promise<void> {
    await this.api.delete(`/documents/${id}`);
  }

  async sendDocumentToSignature(id: number, signData: { zapsignId: string; zapsignSignLink: string }): Promise<Document> {
    const { data } = await this.api.post(`/documents/${id}/send-to-signature`, signData);
    return data;
  }

  async markDocumentAsSigned(id: number, signedData: { signedBy: string }): Promise<Document> {
    const { data } = await this.api.post(`/documents/${id}/mark-as-signed`, signedData);
    return data;
  }

  async generateDocumentAI(clientId: number, documentType: string, caseId?: number): Promise<any> {
    const { data } = await this.api.post('/documents/generate', {
      clientId,
      documentType,
      caseId,
    });
    return data;
  }

  async sendDocumentToZapSign(
    id: number,
    signerEmail: string,
    signerName: string
  ): Promise<any> {
    const { data } = await this.api.post(`/documents/${id}/send-to-zapsign`, {
      signerEmail,
      signerName,
    });
    return data;
  }

  async checkZapSignStatus(id: number): Promise<any> {
    const { data } = await this.api.get(`/documents/${id}/zapsign-status`);
    return data;
  }

  async checkAllPendingSignatures(): Promise<any> {
    const { data } = await this.api.post('/documents/check-signatures');
    return data;
  }

  // ===== Analytics =====
  async getDashboardMetrics(): Promise<any> {
    const { data } = await this.api.get('/analytics/dashboard');
    return data;
  }

  async getDocumentTrends(days: number = 30): Promise<any> {
    const { data } = await this.api.get('/analytics/trends/documents', {
      params: { days },
    });
    return data;
  }

  async getDocumentTypeBreakdown(): Promise<any> {
    const { data } = await this.api.get('/analytics/breakdown/document-types');
    return data;
  }

  async getCaseCompletionByArea(): Promise<any> {
    const { data } = await this.api.get('/analytics/breakdown/case-completion');
    return data;
  }

  async getMonthlyMetrics(month?: number, year?: number): Promise<any> {
    const { data } = await this.api.get('/analytics/monthly', {
      params: { month, year },
    });
    return data;
  }

  async exportMetricsCSV(): Promise<Blob> {
    const { data } = await this.api.get('/analytics/export/csv', {
      responseType: 'blob',
    });
    return data;
  }
}

export default new ApiService();
