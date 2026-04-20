import axios from 'axios';
import { Case } from '../models';
import emailService from './emailService';
// import { differenceInDays } from 'date-fns'; // TODO: Use if needed

interface WebhookPayload {
  event: string;
  caseId?: number;
  clientId?: number;
  data?: any;
  timestamp?: string;
}

interface CaseUpdate {
  caseId: number;
  title: string;
  description?: string;
  status: 'new' | 'active' | 'completed';
  completionPercentage?: number;
  deadline?: Date;
  action: string;
}

class WebhookService {
  private n8nBaseUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678';

  /**
   * Disparar webhook para n8n quando um caso é atualizado
   */
  async triggerCaseUpdateWebhook(caseUpdate: CaseUpdate): Promise<void> {
    try {
      if (!process.env.N8N_WEBHOOK_URL) {
        console.warn('⚠️ N8N_WEBHOOK_URL not configured. Webhook not sent.');
        return;
      }

      const payload: WebhookPayload = {
        event: 'case.updated',
        caseId: caseUpdate.caseId,
        data: caseUpdate,
        timestamp: new Date().toISOString(),
      };

      console.log('🔗 Enviando webhook para n8n:', payload);

      await axios.post(`${this.n8nBaseUrl}/webhook/case-update`, payload, {
        timeout: 10000,
      });

      console.log('✅ Webhook enviado com sucesso para n8n');
    } catch (error) {
      console.error('❌ Erro ao enviar webhook:', error);
      // Não lançar erro - webhook é assíncrono
    }
  }

  /**
   * Disparar webhook quando documento é assinado
   */
  async triggerDocumentSignedWebhook(documentId: number, caseId: number): Promise<void> {
    try {
      if (!process.env.N8N_WEBHOOK_URL) return;

      const payload: WebhookPayload = {
        event: 'document.signed',
        caseId,
        data: { documentId, caseId },
        timestamp: new Date().toISOString(),
      };

      console.log('🔗 Webhook document signed:', documentId);

      await axios.post(`${this.n8nBaseUrl}/webhook/document-signed`, payload, {
        timeout: 10000,
      });

      console.log('✅ Document signed webhook enviado');
    } catch (error) {
      console.error('❌ Erro ao enviar document signed webhook:', error);
    }
  }

  /**
   * Disparar webhook quando novo cliente é criado
   */
  async triggerNewClientWebhook(clientId: number): Promise<void> {
    try {
      if (!process.env.N8N_WEBHOOK_URL) return;

      const payload: WebhookPayload = {
        event: 'client.created',
        clientId,
        timestamp: new Date().toISOString(),
      };

      console.log('🔗 Webhook new client:', clientId);

      await axios.post(`${this.n8nBaseUrl}/webhook/client-created`, payload, {
        timeout: 10000,
      });

      console.log('✅ New client webhook enviado');
    } catch (error) {
      console.error('❌ Erro ao enviar new client webhook:', error);
    }
  }

  /**
   * Webhook receiver: Processar ação de n8n (email, notificação, etc)
   */
  async processN8nAction(action: string, payload: any): Promise<any> {
    try {
      console.log('📥 Processando ação do n8n:', action);

      switch (action) {
        case 'send-email':
          return await this.handleSendEmail(payload);

        case 'send-notification':
          return await this.handleSendNotification(payload);

        case 'update-case-status':
          return await this.handleUpdateCaseStatus(payload);

        case 'create-document':
          return await this.handleCreateDocument(payload);

        default:
          console.warn('⚠️ Ação desconhecida:', action);
          return { success: false, message: 'Unknown action' };
      }
    } catch (error) {
      console.error('❌ Erro ao processar ação n8n:', error);
      throw error;
    }
  }

  /**
   * Ação: Enviar email
   */
  private async handleSendEmail(payload: any) {
    try {
      const { to, subject, message } = payload;

      if (!to) {
        return { success: false, message: 'Email recipient required' };
      }

      const result = await emailService.sendSimpleEmail(to, subject, message);

      console.log('✅ Email enviado via n8n:', to);

      return {
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      throw error;
    }
  }

  /**
   * Ação: Enviar notificação push
   */
  private async handleSendNotification(payload: any) {
    try {
      const { userId, title, message } = payload;

      if (!userId || !title || !message) {
        return { success: false, message: 'Missing required fields' };
      }

      // TODO: Integrar com pushNotificationService
      console.log('📬 Notificação enviada:', { userId, title, message });

      return {
        success: true,
        message: 'Notification sent successfully',
      };
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error);
      throw error;
    }
  }

  /**
   * Ação: Atualizar status do caso
   */
  private async handleUpdateCaseStatus(payload: any) {
    try {
      const { caseId, status } = payload;

      if (!caseId || !status) {
        return { success: false, message: 'caseId and status required' };
      }

      const caseItem = await Case.findByPk(caseId);

      if (!caseItem) {
        return { success: false, message: 'Case not found' };
      }

      await (caseItem as any).update({ status });

      console.log('✅ Caso atualizado:', caseId, status);

      // Enviar webhook de caso atualizado
      await this.triggerCaseUpdateWebhook({
        caseId,
        title: (caseItem as any).title,
        status,
        action: `Status alterado para ${status} via n8n`,
      });

      return {
        success: true,
        message: 'Case status updated',
        caseId,
        newStatus: status,
      };
    } catch (error) {
      console.error('❌ Erro ao atualizar caso:', error);
      throw error;
    }
  }

  /**
   * Ação: Criar documento
   */
  private async handleCreateDocument(payload: any) {
    try {
      const { caseId, title, type } = payload;

      if (!caseId || !title || !type) {
        return { success: false, message: 'Missing required fields' };
      }

      // TODO: Integrar com documentService para criar documento real
      console.log('📄 Documento criado:', { caseId, title, type });

      return {
        success: true,
        message: 'Document created successfully',
        caseId,
        title,
      };
    } catch (error) {
      console.error('❌ Erro ao criar documento:', error);
      throw error;
    }
  }

  /**
   * Gerar workflow de exemplo para n8n
   */
  getN8nWorkflowExample(workflowType: 'case-update' | 'deadline-alert' | 'new-client'): object {
    const workflows: { [key: string]: object } = {
      'case-update': {
        name: 'Case Update Email',
        description:
          'Dispara email quando um caso é atualizado (via webhook do Legal Hub)',
        nodes: [
          {
            name: 'Webhook Trigger',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [250, 300],
            webhook: {
              path: 'case-update',
              method: 'POST',
            },
            credentials: {
              webhookBasicAuth: null,
            },
          },
          {
            name: 'Extract Case Data',
            type: 'n8n-nodes-base.code',
            typeVersion: 1,
            position: [450, 300],
            code: `
const { data, caseId } = $input.first().json.body;
return {
  json: {
    clientEmail: data.clientEmail || 'client@example.com',
    caseName: data.title,
    caseNumber: data.caseNumber || caseId,
    status: data.status,
    progressPercentage: data.completionPercentage || 50,
    description: data.description || 'Caso atualizado',
    urgency: 'green'
  }
};
            `,
          },
          {
            name: 'Send Email',
            type: 'n8n-nodes-base.emailSend',
            typeVersion: 1,
            position: [650, 300],
            credentials: {
              smtp: 'gmail_account',
            },
            parameters: {
              fromEmail: 'noreply@legal-hub.com',
              toEmail: '={{$node["Extract Case Data"].json.clientEmail}}',
              subject:
                '={{$node["Extract Case Data"].json.caseName}} - Caso Atualizado',
              htmlBody:
                'Seu caso {{$node["Extract Case Data"].json.caseName}} foi atualizado. Status: {{$node["Extract Case Data"].json.status}}',
            },
          },
        ],
      },

      'deadline-alert': {
        name: 'Deadline Alert',
        description: 'Envia alerta quando prazo está próximo',
        nodes: [
          {
            name: 'Daily Trigger',
            type: 'n8n-nodes-base.interval',
            typeVersion: 1,
            position: [250, 300],
            parameters: {
              interval: [1, 'days'],
            },
          },
          {
            name: 'Fetch Cases from API',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 3,
            position: [450, 300],
            parameters: {
              method: 'GET',
              url: 'https://localhost:3000/api/cases?deadline=next7days',
              authentication: 'oAuth2',
            },
          },
          {
            name: 'Loop Through Cases',
            type: 'n8n-nodes-base.loop',
            typeVersion: 1,
            position: [650, 300],
          },
          {
            name: 'Send Deadline Alert',
            type: 'n8n-nodes-base.emailSend',
            typeVersion: 1,
            position: [850, 300],
          },
        ],
      },

      'new-client': {
        name: 'New Client Welcome',
        description: 'Envia email de boas-vindas quando novo cliente é criado',
        nodes: [
          {
            name: 'Webhook: New Client',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [250, 300],
            webhook: {
              path: 'client-created',
              method: 'POST',
            },
          },
          {
            name: 'Fetch Client Details',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 3,
            position: [450, 300],
            parameters: {
              method: 'GET',
              url: 'https://localhost:3000/api/clients/{{$node.Webhook.json.body.clientId}}',
            },
          },
          {
            name: 'Send Welcome Email',
            type: 'n8n-nodes-base.emailSend',
            typeVersion: 1,
            position: [650, 300],
            parameters: {
              subject: 'Bem-vindo ao Legal Hub!',
              htmlBody:
                'Olá {{$node["Fetch Client Details"].json.name}}, bem-vindo!',
            },
          },
        ],
      },
    };

    return workflows[workflowType] || workflows['case-update'];
  }
}

export default new WebhookService();
