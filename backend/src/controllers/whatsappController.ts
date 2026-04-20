import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendWhatsAppMessage, getWhatsAppStatus } from '../services/whatsappService';

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        error: 'phoneNumber e message são obrigatórios',
      });
    }

    const result = await sendWhatsAppMessage(phoneNumber, message);

    return res.json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      result,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const getStatus = async (_req: AuthRequest, res: Response) => {
  try {
    const status = getWhatsAppStatus();

    return res.json(status);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const sendBulkMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { phoneNumbers, message } = req.body;

    if (!Array.isArray(phoneNumbers) || !message) {
      return res.status(400).json({
        error: 'phoneNumbers (array) e message são obrigatórios',
      });
    }

    const results = await Promise.allSettled(
      phoneNumbers.map((phone) => sendWhatsAppMessage(phone, message))
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return res.json({
      success: true,
      message: `${successful} mensagens enviadas, ${failed} falharam`,
      results,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const qrCodeStatus = async (_req: AuthRequest, res: Response) => {
  try {
    const status = getWhatsAppStatus();

    return res.json({
      isConnected: status.isConnected,
      message: status.isConnected
        ? 'WhatsApp conectado'
        : 'WhatsApp não conectado. Acesse /api/whatsapp/qr para gerar QR Code',
      user: status.user,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
