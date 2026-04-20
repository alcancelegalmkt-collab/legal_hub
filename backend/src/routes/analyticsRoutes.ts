import express from 'express';
import * as analyticsController from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Dashboard
router.get('/dashboard', analyticsController.getDashboardMetrics);

// Trends and Analysis
router.get('/trends/documents', analyticsController.getDocumentTrends);
router.get('/breakdown/document-types', analyticsController.getDocumentTypeBreakdown);
router.get('/breakdown/case-completion', analyticsController.getCaseCompletionByArea);

// Monthly Metrics
router.get('/monthly', analyticsController.getMonthlyMetrics);

// Export
router.get('/export/csv', analyticsController.exportMetricsCSV);

export default router;
