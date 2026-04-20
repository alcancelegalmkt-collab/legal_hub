import { Request, Response } from 'express';
import emailService from '../services/emailService';

export const sendCaseUpdate = async (_req: Request, res: Response) => {
  try {
    const {
      clientName,
      clientEmail,
      caseName,
      caseNumber,
      description,
      status,
      completionPercentage,
      nextDeadline,
      recentActivities,
      requiredDocuments,
      urgencyLevel,
    } = req.body;

    // Validar campos obrigatórios
    if (!clientEmail || !caseName || !caseNumber) {
      return res.status(400).json({
        error: 'Missing required fields: clientEmail, caseName, caseNumber',
      });
    }

    const result = await emailService.sendCaseUpdate({
      clientName,
      clientEmail,
      caseName,
      caseNumber,
      description,
      status: status || 'active',
      completionPercentage: completionPercentage || 50,
      nextDeadline,
      recentActivities: recentActivities || [],
      requiredDocuments,
      urgencyLevel: urgencyLevel || 'green',
    });

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('❌ Error in sendCaseUpdate:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const sendTestEmail = async (_req: Request, res: Response) => {
  try {
    const { to, subject, message } = req.body;

    if (!to) {
      return res.status(400).json({ error: 'Email "to" is required' });
    }

    const result = await emailService.sendSimpleEmail(
      to,
      subject || 'Test Email from Legal Hub',
      message || 'This is a test email to verify Resend configuration.'
    );

    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('❌ Error in sendTestEmail:', error);
    return res.status(500).json({
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getEmailPreview = (__req: Request, res: Response) => {
  try {
    const preview = emailService.generateCaseUpdateEmail({
      clientName: 'João Silva',
      clientEmail: 'joao@example.com',
      caseName: 'Silva vs. Empresa XYZ',
      caseNumber: 'PROC-2024-001234',
      description: 'Ação trabalhista. Aguardando sentença do juiz. Última audiência foi produtiva.',
      status: 'active',
      completionPercentage: 65,
      nextDeadline: {
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        description: 'Entrega de documentos de defesa',
        type: 'document',
      },
      recentActivities: [
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          action: 'Audiência realizada',
          details: 'Audiência com o juiz realizada com sucesso. Próxima data marcada.',
        },
        {
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          action: 'Documentos enviados',
          details: 'Todos os documentos de petição inicial foram enviados ao tribunal.',
        },
        {
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          action: 'Caso aberto',
          details: 'Seu caso foi aberto e registrado no sistema.',
        },
      ],
      requiredDocuments: [
        'Cópia da identidade',
        'Comprovante de residência',
        'Documentos trabalhistas (contracheques)',
      ],
      urgencyLevel: 'orange',
    });

    return res.status(200).json({
      success: true,
      preview: {
        subject: preview.subject,
        to: preview.to,
        htmlPreview: preview.html,
      },
    });
  } catch (error) {
    console.error('❌ Error in getEmailPreview:', error);
    return res.status(500).json({
      error: 'Failed to generate email preview',
    });
  }
};
