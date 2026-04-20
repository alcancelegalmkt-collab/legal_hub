import { Request, Response } from 'express';
import webhookService from '../services/webhookService';

/**
 * Receber webhook do n8n com ações para executar
 */
export const handleN8nWebhook = async (req: Request, res: Response) => {
  try {
    const { action, payload } = req.body;

    if (!action) {
      return res.status(400).json({
        error: 'Action is required',
        example: { action: 'send-email', payload: { to: 'email@example.com' } },
      });
    }

    console.log('📥 Webhook recebido do n8n:', action);

    const result = await webhookService.processN8nAction(action, payload);

    return res.status(200).json({
      success: true,
      message: `Action "${action}" processed`,
      result,
    });
  } catch (error) {
    console.error('❌ Erro ao processar webhook n8n:', error);
    return res.status(500).json({
      error: 'Failed to process webhook',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Trigger: Caso foi atualizado
 * Dispara quando um caso é atualizado (para enviar para n8n)
 */
export const triggerCaseUpdate = async (req: Request, res: Response) => {
  try {
    const { caseId, title, description, status, completionPercentage, deadline, action } =
      req.body;

    if (!caseId || !status) {
      return res.status(400).json({
        error: 'caseId and status are required',
      });
    }

    await webhookService.triggerCaseUpdateWebhook({
      caseId,
      title,
      description,
      status,
      completionPercentage,
      deadline: deadline ? new Date(deadline) : undefined,
      action: action || 'Case updated',
    });

    return res.status(200).json({
      success: true,
      message: 'Case update webhook triggered',
      caseId,
    });
  } catch (error) {
    console.error('❌ Erro ao disparar webhook:', error);
    return res.status(500).json({
      error: 'Failed to trigger webhook',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Trigger: Documento foi assinado
 */
export const triggerDocumentSigned = async (req: Request, res: Response) => {
  try {
    const { documentId, caseId } = req.body;

    if (!documentId || !caseId) {
      return res.status(400).json({
        error: 'documentId and caseId are required',
      });
    }

    await webhookService.triggerDocumentSignedWebhook(documentId, caseId);

    return res.status(200).json({
      success: true,
      message: 'Document signed webhook triggered',
      documentId,
      caseId,
    });
  } catch (error) {
    console.error('❌ Erro ao disparar webhook:', error);
    return res.status(500).json({
      error: 'Failed to trigger webhook',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Trigger: Novo cliente foi criado
 */
export const triggerNewClient = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({
        error: 'clientId is required',
      });
    }

    await webhookService.triggerNewClientWebhook(clientId);

    return res.status(200).json({
      success: true,
      message: 'New client webhook triggered',
      clientId,
    });
  } catch (error) {
    console.error('❌ Erro ao disparar webhook:', error);
    return res.status(500).json({
      error: 'Failed to trigger webhook',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Obter exemplos de workflows do n8n
 */
export const getN8nWorkflowExamples = (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    const validTypes = ['case-update', 'deadline-alert', 'new-client'];

    if (type && !validTypes.includes(type as string)) {
      return res.status(400).json({
        error: `Invalid workflow type. Valid types: ${validTypes.join(', ')}`,
      });
    }

    const workflowType = (type || 'case-update') as
      | 'case-update'
      | 'deadline-alert'
      | 'new-client';

    const workflow = webhookService.getN8nWorkflowExample(workflowType);

    return res.status(200).json({
      success: true,
      workflow,
      instructions: {
        step1: 'Copiar o workflow acima',
        step2: 'Abrir n8n → New Workflow',
        step3: 'Cole o JSON ou configure manualmente',
        step4: 'Configure credenciais (email, API keys)',
        step5: 'Ative o workflow (toggle no canto)',
      },
    });
  } catch (error) {
    console.error('❌ Erro ao obter workflow example:', error);
    return res.status(500).json({
      error: 'Failed to get workflow examples',
    });
  }
};

/**
 * Health check para n8n
 */
export const webhookHealth = (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Webhook service is running',
    timestamp: new Date(),
    endpoints: {
      'POST /api/webhooks/n8n-action': 'Process action from n8n',
      'POST /api/webhooks/case-update': 'Trigger case update webhook',
      'POST /api/webhooks/document-signed': 'Trigger document signed webhook',
      'POST /api/webhooks/client-created': 'Trigger new client webhook',
      'GET /api/webhooks/workflows': 'Get n8n workflow examples',
      'GET /api/webhooks/health': 'Health check',
    },
  });
};
