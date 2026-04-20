import express from 'express';
import {
  getDashboardMetrics,
  getActivityLogs,
  getEmailStats,
  getHourlyStats,
  getHealthStatus,
} from '../controllers/monitoringController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// GET /api/monitoring/dashboard - Métricas principais
router.get('/dashboard', authMiddleware, getDashboardMetrics);

// GET /api/monitoring/logs - Activity logs
router.get('/logs', authMiddleware, getActivityLogs);

// GET /api/monitoring/emails - Estatísticas de email
router.get('/emails', authMiddleware, getEmailStats);

// GET /api/monitoring/hourly - Dados por hora (para gráfico)
router.get('/hourly', authMiddleware, getHourlyStats);

// GET /api/monitoring/health - Status de saúde do sistema
router.get('/health', authMiddleware, getHealthStatus);

export default router;
