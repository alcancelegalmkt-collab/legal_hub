import { Router, Request, Response, NextFunction } from 'express';
import { createCompleteLead, getLegalAreas, getCaseTypesByArea } from '../controllers/leadCompleteController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Log all requests to this router
router.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[leadCompleteRoutes] ${req.method} ${req.path}`);
  next();
});

/**
 * POST /api/leads/complete
 * Create a complete lead with all 7 blocks
 */
router.post('/complete', authMiddleware, createCompleteLead);

/**
 * GET /api/legal-areas
 * Get all legal areas for form dropdown
 */
router.get('/legal-areas', authMiddleware, getLegalAreas);

/**
 * GET /api/case-types
 * Get case types for a specific legal area
 * Query params: legalAreaId
 */
router.get('/case-types', authMiddleware, getCaseTypesByArea);

export default router;
