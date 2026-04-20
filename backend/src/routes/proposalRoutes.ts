import express from 'express';
import * as proposalController from '../controllers/proposalController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Generate proposal preview (HTML)
router.post('/:leadId/preview', proposalController.generateProposalPreview);

// Generate proposal as PDF (rendered)
router.post('/:leadId/pdf', proposalController.generateProposalPDF);

// Send proposal by email
router.post('/:leadId/send-email', proposalController.sendProposalByEmail);

// Send proposal by WhatsApp
router.post('/:leadId/send-whatsapp', proposalController.sendProposalByWhatsApp);

export default router;
