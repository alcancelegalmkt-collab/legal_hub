import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import notificationService from '../services/notificationService';

export const subscribeToPushNotifications = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { endpoint, p256dh, auth } = req.body;
    const userId = req.user?.id;

    if (!userId || !endpoint) {
      return res.status(400).json({
        error: 'userId e endpoint são obrigatórios',
      });
    }

    await notificationService.saveSubscription({
      userId,
      endpoint,
      p256dh,
      auth,
    });

    return res.json({
      message: 'Inscrição em notificações realizada com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao inscrever em notificações:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const unsubscribeFromPushNotifications = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        error: 'endpoint é obrigatório',
      });
    }

    await notificationService.removeSubscription(endpoint);

    return res.json({
      message: 'Desincrição de notificações realizada com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao desinscrever de notificações:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const sendNotification = async (_req: AuthRequest, res: Response) => {
  try {
    const { userId, title, body, icon, tag, url } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        error: 'userId, title e body são obrigatórios',
      });
    }

    const result = await notificationService.sendNotification(userId, {
      title,
      body,
      icon,
      tag,
      data: { url: url || '/' },
    });

    return res.json({
      message: 'Notificação enviada com sucesso',
      result,
    });
  } catch (error: any) {
    console.error('Erro ao enviar notificação:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const notifyDocumentSigned = async (_req: AuthRequest, res: Response) => {
  try {
    const { documentId, clientName, documentType } = req.body;

    if (!documentId || !clientName || !documentType) {
      return res.status(400).json({
        error: 'documentId, clientName e documentType são obrigatórios',
      });
    }

    // Get document owner
    const Document = require('../models/Document').default;
    const document = await Document.findByPk(documentId);

    if (!document) {
      return res.status(404).json({
        error: 'Documento não encontrado',
      });
    }

    // Send notification to all users (or specific team)
    await notificationService.broadcastNotification({
      title: '✅ Documento Assinado',
      body: `${documentType} de ${clientName} foi assinado com sucesso`,
      icon: '/favicon.ico',
      tag: `document-${documentId}`,
      data: {
        url: `/documents/${documentId}`,
      },
    });

    return res.json({
      message: 'Notificações de assinatura enviadas com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao notificar assinatura:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const notifyDocumentGenerated = async (_req: AuthRequest, res: Response) => {
  try {
    const { documentId, clientName, documentType } = req.body;

    if (!documentId || !clientName || !documentType) {
      return res.status(400).json({
        error: 'documentId, clientName e documentType são obrigatórios',
      });
    }

    await notificationService.broadcastNotification({
      title: '📄 Documento Gerado',
      body: `Novo ${documentType} gerado para ${clientName}`,
      icon: '/favicon.ico',
      tag: `document-generated-${documentId}`,
      data: {
        url: `/documents/${documentId}`,
      },
    });

    return res.json({
      message: 'Notificações de geração enviadas com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao notificar geração:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const notifyCaseStatusChanged = async (_req: AuthRequest, res: Response) => {
  try {
    const { caseId, caseName, newStatus } = req.body;

    if (!caseId || !caseName || !newStatus) {
      return res.status(400).json({
        error: 'caseId, caseName e newStatus são obrigatórios',
      });
    }

    await notificationService.broadcastNotification({
      title: '⚖️ Caso Atualizado',
      body: `Status de "${caseName}" alterado para ${newStatus}`,
      icon: '/favicon.ico',
      tag: `case-${caseId}`,
      data: {
        url: `/cases/${caseId}`,
      },
    });

    return res.json({
      message: 'Notificações de caso enviadas com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao notificar caso:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getNotificationSettings = async (_req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Não autenticado',
      });
    }

    const settings = await notificationService.getUserSettings(userId);

    return res.json({
      message: 'Configurações de notificação recuperadas',
      settings,
    });
  } catch (error: any) {
    console.error('Erro ao obter configurações:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const updateNotificationSettings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const { emailNotifications, pushNotifications, preferences } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Não autenticado',
      });
    }

    const settings = await notificationService.updateUserSettings(userId, {
      emailNotifications,
      pushNotifications,
      preferences,
    });

    return res.json({
      message: 'Configurações atualizadas com sucesso',
      settings,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar configurações:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};
