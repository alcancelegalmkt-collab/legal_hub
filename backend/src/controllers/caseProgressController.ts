import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import caseProgressService from '../services/caseProgressService';
import clientUpdateService from '../services/clientUpdateService';
import googleCalendarService from '../services/googleCalendarService';

export const getCaseProgress = async (_req: AuthRequest, res: Response) => {
  try {
    const { caseId } = req.params;

    if (!caseId) {
      return res.status(400).json({
        error: 'caseId é obrigatório',
      });
    }

    const progress = await caseProgressService.getCaseProgress(parseInt(caseId));

    return res.json({
      message: 'Progresso do caso obtido com sucesso',
      progress,
    });
  } catch (error: any) {
    console.error('Erro ao obter progresso:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getCaseProgressByClient = async (_req: AuthRequest, res: Response) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({
        error: 'clientId é obrigatório',
      });
    }

    const progressList = await caseProgressService.getCaseProgressByClient(
      parseInt(clientId)
    );

    return res.json({
      message: 'Progresso dos casos obtido com sucesso',
      cases: progressList,
      totalCases: progressList.length,
    });
  } catch (error: any) {
    console.error('Erro ao obter progresso dos casos:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getOpenCasesWithDeadlines = async (_req: AuthRequest, res: Response) => {
  try {
    const lawyerId = req.user?.id;

    if (!lawyerId) {
      return res.status(401).json({
        error: 'Não autenticado',
      });
    }

    const cases = await caseProgressService.getOpenCasesWithDeadlines(lawyerId);

    return res.json({
      message: 'Casos abertos com prazos obtidos',
      cases,
      totalCases: cases.length,
      overdueCases: cases.filter((c) => c.daysUntilDeadline && c.daysUntilDeadline < 0).length,
      urgentCases: cases.filter((c) => c.daysUntilDeadline && c.daysUntilDeadline <= 7).length,
    });
  } catch (error: any) {
    console.error('Erro ao obter casos com prazos:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getOverdueDeadlines = async (_req: AuthRequest, res: Response) => {
  try {
    const lawyerId = req.user?.id;

    if (!lawyerId) {
      return res.status(401).json({
        error: 'Não autenticado',
      });
    }

    const cases = await caseProgressService.getOverdueDeadlines(lawyerId);

    return res.json({
      message: 'Prazos vencidos obtidos',
      cases,
      totalOverdue: cases.length,
    });
  } catch (error: any) {
    console.error('Erro ao obter prazos vencidos:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getClientSummary = async (_req: AuthRequest, res: Response) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({
        error: 'clientId é obrigatório',
      });
    }

    const summary = await clientUpdateService.generateClientSummary(parseInt(clientId));

    return res.json({
      message: 'Resumo do cliente obtido com sucesso',
      summary,
    });
  } catch (error: any) {
    console.error('Erro ao obter resumo:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const generateClientEmail = async (_req: AuthRequest, res: Response) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({
        error: 'clientId é obrigatório',
      });
    }

    const emailContent = await clientUpdateService.generateUpdateEmail(parseInt(clientId));

    return res.json({
      message: 'Email de atualização gerado com sucesso',
      subject: emailContent.subject,
      preview: emailContent.plainTextContent.substring(0, 500),
    });
  } catch (error: any) {
    console.error('Erro ao gerar email:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const sendClientUpdate = async (_req: AuthRequest, res: Response) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({
        error: 'clientId é obrigatório',
      });
    }

    // TODO: Implement email service integration
    // await clientUpdateService.sendUpdateToClient(parseInt(clientId), emailService);

    return res.json({
      message: 'Atualização enviada com sucesso para o cliente',
    });
  } catch (error: any) {
    console.error('Erro ao enviar atualização:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const syncToGoogleCalendar = async (_req: AuthRequest, res: Response) => {
  try {
    const { caseId, calendarId } = req.body;

    if (!caseId || !calendarId) {
      return res.status(400).json({
        error: 'caseId e calendarId são obrigatórios',
      });
    }

    const progress = await caseProgressService.getCaseProgress(caseId);

    if (!progress.nextDeadline) {
      return res.status(400).json({
        error: 'Nenhum prazo próximo para sincronizar',
      });
    }

    const event = await googleCalendarService.createCaseDeadlineEvent(calendarId, {
      caseId,
      caseName: progress.caseName,
      deadline: progress.nextDeadline.date,
      type: 'other',
      description: progress.nextDeadline.description,
    });

    return res.json({
      message: 'Evento sincronizado com Google Calendar com sucesso',
      event,
    });
  } catch (error: any) {
    console.error('Erro ao sincronizar com Google Calendar:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getUpcomingDeadlines = async (_req: AuthRequest, res: Response) => {
  try {
    const { calendarId } = req.query;

    if (!calendarId) {
      return res.status(400).json({
        error: 'calendarId é obrigatório',
      });
    }

    const events = await googleCalendarService.getUpcomingDeadlines(calendarId as string, 30);

    return res.json({
      message: 'Prazos próximos obtidos',
      events,
      totalDeadlines: events.length,
    });
  } catch (error: any) {
    console.error('Erro ao obter prazos próximos:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};
