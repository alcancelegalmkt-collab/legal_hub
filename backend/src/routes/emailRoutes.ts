import express from 'express';
import { sendCaseUpdate, sendTestEmail, getEmailPreview } from '../controllers/emailController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// POST /api/emails/send-case-update - Enviar atualização de caso
router.post('/send-case-update', authMiddleware, sendCaseUpdate);

// POST /api/emails/test - Enviar email de teste (desenvolvimento)
router.post('/test', authMiddleware, sendTestEmail);

// GET /api/emails/preview - Preview do email (desenvolvimento)
router.get('/preview', authMiddleware, getEmailPreview);

export default router;
