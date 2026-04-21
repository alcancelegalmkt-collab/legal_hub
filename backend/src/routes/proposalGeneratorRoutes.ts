import { Router } from 'express';
import {
  generateProposals,
  downloadProposal,
  previewProposal,
  getDocumentTypes,
} from '../controllers/proposalGeneratorController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * POST /api/proposals/generate
 * Generate legal documents for a lead
 */
router.post('/generate', authMiddleware, generateProposals);

/**
 * GET /api/proposals/document-types
 * Get available document types
 */
router.get('/document-types', authMiddleware, getDocumentTypes);

/**
 * GET /api/proposals/download/:leadId/:documentType
 * Download a specific generated document
 */
router.get('/download/:leadId/:documentType', authMiddleware, downloadProposal);

/**
 * POST /api/proposals/:leadId/preview/:documentType
 * Preview a document
 */
router.post('/:leadId/preview/:documentType', authMiddleware, previewProposal);

export default router;
