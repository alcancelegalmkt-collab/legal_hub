import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
// import analyticsService from '../services/analyticsService'; // TODO: Re-enable when service is fixed
const analyticsService: any = {};

export const getDashboardMetrics = async (_req: AuthRequest, res: Response) => {
  try {
    const metrics = await analyticsService.getDashboardMetrics();

    return res.json({
      message: 'Dashboard metrics retrieved',
      metrics,
    });
  } catch (error: any) {
    console.error('Erro ao obter métricas do dashboard:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getDocumentTrends = async (req: AuthRequest, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const trends = await analyticsService.getDocumentTrends(Number(days));

    return res.json({
      message: 'Document trends retrieved',
      days: Number(days),
      data: trends,
    });
  } catch (error: any) {
    console.error('Erro ao obter tendências de documentos:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getDocumentTypeBreakdown = async (_req: AuthRequest, res: Response) => {
  try {
    const breakdown = await analyticsService.getDocumentTypeBreakdown();

    return res.json({
      message: 'Document type breakdown retrieved',
      data: breakdown,
    });
  } catch (error: any) {
    console.error('Erro ao obter breakdown de tipos de documento:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getCaseCompletionByArea = async (_req: AuthRequest, res: Response) => {
  try {
    const completion = await analyticsService.getCaseCompletionByArea();

    return res.json({
      message: 'Case completion by area retrieved',
      data: completion,
    });
  } catch (error: any) {
    console.error('Erro ao obter taxa de conclusão de casos:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getMonthlyMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const { month, year } = req.query;
    const metrics = await analyticsService.getMonthlyMetrics(
      month ? Number(month) : undefined,
      year ? Number(year) : undefined
    );

    return res.json({
      message: 'Monthly metrics retrieved',
      metrics,
    });
  } catch (error: any) {
    console.error('Erro ao obter métricas mensais:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const exportMetricsCSV = async (_req: AuthRequest, res: Response) => {
  try {
    const csv = await analyticsService.exportMetricsToCSV();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="legal-hub-metrics.csv"');
    return res.send(csv);
  } catch (error: any) {
    console.error('Erro ao exportar métricas:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};
