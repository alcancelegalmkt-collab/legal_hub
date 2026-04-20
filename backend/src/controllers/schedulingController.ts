import { Request, Response } from 'express';
import schedulingService from '../services/schedulingService';

export const listActiveJobs = (__req: Request, res: Response) => {
  try {
    const activeJobs = schedulingService.listActiveJobs();

    return res.status(200).json({
      success: true,
      message: 'Active scheduling jobs',
      jobs: activeJobs,
      totalJobs: activeJobs.length,
      jobsDescription: {
        weeklyClientUpdates: 'Envio semanal de atualizações (segunda 9:00)',
        deadlineAlerts: 'Alertas diários de prazos próximos (diariamente 8:00)',
        completedCaseSummary:
          'Resumo semanal de casos concluídos (sexta 17:00)',
      },
    });
  } catch (error) {
    console.error('❌ Error in listActiveJobs:', error);
    return res.status(500).json({
      error: 'Failed to list active jobs',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const stopJob = (_req: Request, res: Response) => {
  try {
    const { jobName } = req.params;

    if (!jobName) {
      return res.status(400).json({ error: 'jobName parameter is required' });
    }

    schedulingService.stopJob(jobName);

    return res.status(200).json({
      success: true,
      message: `Job "${jobName}" stopped successfully`,
    });
  } catch (error) {
    console.error('❌ Error in stopJob:', error);
    return res.status(500).json({
      error: 'Failed to stop job',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const stopAllJobs = (__req: Request, res: Response) => {
  try {
    schedulingService.stopAllJobs();

    return res.status(200).json({
      success: true,
      message: 'All scheduling jobs stopped successfully',
    });
  } catch (error) {
    console.error('❌ Error in stopAllJobs:', error);
    return res.status(500).json({
      error: 'Failed to stop all jobs',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getScheduleInfo = (__req: Request, res: Response) => {
  try {
    const scheduleInfo = {
      jobs: [
        {
          name: 'weeklyClientUpdates',
          schedule: '0 9 * * 1',
          description: 'Envio semanal de atualizações para clientes',
          frequency: 'Toda segunda-feira às 9:00 AM',
          actions: [
            'Busca todos os clientes ativos',
            'Para cada cliente: busca casos em progresso',
            'Envia email com status atualizado',
            'Calcula urgência baseado em prazos',
          ],
        },
        {
          name: 'deadlineAlerts',
          schedule: '0 8 * * *',
          description:
            'Alertas diários para prazos próximos (próximos 7 dias)',
          frequency: 'Diariamente às 8:00 AM',
          actions: [
            'Busca casos com prazos nos próximos 7 dias',
            'Calcula dias restantes',
            'Define urgência (verde/laranja/vermelho)',
            'Envia alerta por email',
          ],
        },
        {
          name: 'completedCaseSummary',
          schedule: '0 17 * * 5',
          description: 'Resumo semanal de casos concluídos',
          frequency: 'Toda sexta-feira às 5:00 PM',
          actions: [
            'Busca casos concluídos na última semana',
            'Agrupa por cliente',
            'Envia resumo de sucesso',
          ],
        },
      ],
      cronFormat: 'minute hour day-of-month month day-of-week',
      cronExample: '0 9 * * 1 = segunda-feira às 9:00 AM',
      timezoneNote:
        'Usa timezone do servidor. Configure TZ=America/Sao_Paulo para horário brasileiro',
    };

    return res.status(200).json({
      success: true,
      schedule: scheduleInfo,
    });
  } catch (error) {
    console.error('❌ Error in getScheduleInfo:', error);
    return res.status(500).json({
      error: 'Failed to get schedule info',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
