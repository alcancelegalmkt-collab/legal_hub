import express from 'express';
import * as caseProgressController from '../controllers/caseProgressController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Case Progress
router.get('/cases/:caseId', caseProgressController.getCaseProgress);
router.get('/clients/:clientId/cases', caseProgressController.getCaseProgressByClient);

// Deadlines
router.get('/deadlines/open', caseProgressController.getOpenCasesWithDeadlines);
router.get('/deadlines/overdue', caseProgressController.getOverdueDeadlines);

// Client Updates
router.get('/clients/:clientId/summary', caseProgressController.getClientSummary);
router.get('/clients/:clientId/email', caseProgressController.generateClientEmail);
router.post('/clients/:clientId/send-update', caseProgressController.sendClientUpdate);

// Google Calendar Integration
router.post('/sync-calendar', caseProgressController.syncToGoogleCalendar);
router.get('/calendar/upcoming-deadlines', caseProgressController.getUpcomingDeadlines);

export default router;
