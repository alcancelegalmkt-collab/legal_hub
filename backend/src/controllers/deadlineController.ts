import { Request, Response } from 'express';
// import deadlineService from '../services/deadlineService'; // TODO: Re-enable when service is fixed
const deadlineService: any = {};

export const getUpcomingDeadlines = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const daysAhead = Math.min(parseInt(days as string) || 30, 365);

    const deadlines = await deadlineService.getUpcomingDeadlines(daysAhead);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      count: deadlines.length,
      deadlines,
    });
  } catch (error) {
    console.error('❌ Erro ao obter prazos próximos:', error);
    return res.status(500).json({
      error: 'Failed to get upcoming deadlines',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getCriticalDeadlines = async (__req: Request, res: Response) => {
  try {
    const deadlines = await deadlineService.getCriticalDeadlines();

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      count: deadlines.length,
      message: `${deadlines.length} prazo(s) crítico(s) nos próximos 2 dias`,
      deadlines,
    });
  } catch (error) {
    console.error('❌ Erro ao obter prazos críticos:', error);
    return res.status(500).json({
      error: 'Failed to get critical deadlines',
    });
  }
};

export const getOverdueDeadlines = async (__req: Request, res: Response) => {
  try {
    const deadlines = await deadlineService.getOverdueDeadlines();

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      count: deadlines.length,
      message:
        deadlines.length > 0
          ? `⚠️ ${deadlines.length} prazo(s) vencido(s)!`
          : 'Nenhum prazo vencido',
      deadlines,
    });
  } catch (error) {
    console.error('❌ Erro ao obter prazos vencidos:', error);
    return res.status(500).json({
      error: 'Failed to get overdue deadlines',
    });
  }
};

export const sendDeadlineAlerts = async (__req: Request, res: Response) => {
  try {
    const result = await deadlineService.sendDeadlineAlerts();

    return res.status(200).json({
      success: true,
      message: 'Deadline alerts sent',
      sent: result.sent,
      failed: result.failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erro ao enviar alertas:', error);
    return res.status(500).json({
      error: 'Failed to send deadline alerts',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getDeadlineTimeline = async (req: Request, res: Response) => {
  try {
    const { months = 3 } = req.query;
    const monthsAhead = Math.min(parseInt(months as string) || 3, 12);

    const timeline = await deadlineService.getDeadlineTimeline(monthsAhead);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      data: timeline,
    });
  } catch (error) {
    console.error('❌ Erro ao obter timeline:', error);
    return res.status(500).json({
      error: 'Failed to get deadline timeline',
    });
  }
};

export const getDeadlineStats = async (__req: Request, res: Response) => {
  try {
    const stats = await deadlineService.getDeadlineStats();

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
    });
  } catch (error) {
    console.error('❌ Erro ao obter stats de prazos:', error);
    return res.status(500).json({
      error: 'Failed to get deadline stats',
    });
  }
};
