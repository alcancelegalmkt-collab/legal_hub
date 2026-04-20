import express from 'express';
import {
  getUpcomingDeadlines,
  getCriticalDeadlines,
  getOverdueDeadlines,
  sendDeadlineAlerts,
  getDeadlineTimeline,
  getDeadlineStats,
} from '../controllers/deadlineController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// GET /api/deadlines - Prazos próximos (próximos 30 dias por padrão)
router.get('/', authMiddleware, getUpcomingDeadlines);

// GET /api/deadlines/critical - Prazos críticos (próximas 48h)
router.get('/critical', authMiddleware, getCriticalDeadlines);

// GET /api/deadlines/overdue - Prazos vencidos
router.get('/overdue', authMiddleware, getOverdueDeadlines);

// GET /api/deadlines/timeline - Timeline para gráfico
router.get('/timeline', authMiddleware, getDeadlineTimeline);

// GET /api/deadlines/stats - Estatísticas de prazos
router.get('/stats', authMiddleware, getDeadlineStats);

// POST /api/deadlines/send-alerts - Enviar alertas manualmente
router.post('/send-alerts', authMiddleware, sendDeadlineAlerts);

export default router;
