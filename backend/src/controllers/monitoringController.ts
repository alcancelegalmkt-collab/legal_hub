import { Request, Response } from 'express';
import monitoringService from '../services/monitoringService';

export const getDashboardMetrics = async (__req: Request, res: Response) => {
  try {
    const metrics = await monitoringService.getDashboardMetrics();

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics,
    });
  } catch (error) {
    console.error('❌ Erro ao obter métricas:', error);
    return res.status(500).json({
      error: 'Failed to get dashboard metrics',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getActivityLogs = (_req: Request, res: Response) => {
  try {
    const { limit = '50', type } = req.query;
    const limitNum = Math.min(parseInt(limit as string) || 50, 500);

    const logs = monitoringService.getActivityLogs(
      limitNum,
      type as any
    );

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error('❌ Erro ao obter logs:', error);
    return res.status(500).json({
      error: 'Failed to get activity logs',
    });
  }
};

export const getEmailStats = (__req: Request, res: Response) => {
  try {
    const stats = monitoringService.getEmailStats();

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      stats,
    });
  } catch (error) {
    console.error('❌ Erro ao obter stats de email:', error);
    return res.status(500).json({
      error: 'Failed to get email stats',
    });
  }
};

export const getHourlyStats = (__req: Request, res: Response) => {
  try {
    const stats = monitoringService.getHourlyStats();

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      data: stats,
    });
  } catch (error) {
    console.error('❌ Erro ao obter hourly stats:', error);
    return res.status(500).json({
      error: 'Failed to get hourly stats',
    });
  }
};

export const getHealthStatus = (__req: Request, res: Response) => {
  try {
    const health = monitoringService.getHealthStatus();

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      health,
    });
  } catch (error) {
    console.error('❌ Erro ao obter health status:', error);
    return res.status(500).json({
      error: 'Failed to get health status',
    });
  }
};
