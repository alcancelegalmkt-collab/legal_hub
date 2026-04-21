import { Router } from 'express';
import {
  convertLeadToClient,
  convertOnProposalAcceptance,
  getConversionStatus,
  getUnconvertedLeads,
  getAcceptedButNotConvertedLeads,
  autoConvertAcceptedLeads,
  batchConvertLeads,
  revertConversion,
} from '../controllers/leadConversionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * Manual conversion endpoints
 */

/**
 * POST /api/leads/:leadId/convert
 * Manually convert a lead to client
 */
router.post('/:leadId/convert', authMiddleware, convertLeadToClient);

/**
 * POST /api/leads/convert-on-acceptance
 * Automatic trigger from proposal acceptance webhook
 */
router.post('/convert-on-acceptance', authMiddleware, convertOnProposalAcceptance);

/**
 * Query/Status endpoints
 */

/**
 * GET /api/leads/:leadId/conversion-status
 * Check conversion status of a specific lead
 */
router.get('/:leadId/conversion-status', authMiddleware, getConversionStatus);

/**
 * GET /api/leads/unconverted
 * List all unconverted leads
 */
router.get('/unconverted', authMiddleware, getUnconvertedLeads);

/**
 * GET /api/leads/accepted-not-converted
 * List accepted proposals not yet converted to clients
 */
router.get('/accepted-not-converted', authMiddleware, getAcceptedButNotConvertedLeads);

/**
 * Batch operation endpoints
 */

/**
 * POST /api/leads/auto-convert
 * Auto-convert all accepted leads (batch)
 */
router.post('/auto-convert', authMiddleware, autoConvertAcceptedLeads);

/**
 * POST /api/leads/batch-convert
 * Convert multiple specific leads
 */
router.post('/batch-convert', authMiddleware, batchConvertLeads);

/**
 * Recovery endpoints
 */

/**
 * DELETE /api/leads/:leadId/revert-conversion
 * Revert conversion (testing/recovery)
 */
router.delete('/:leadId/revert-conversion', authMiddleware, revertConversion);

export default router;
