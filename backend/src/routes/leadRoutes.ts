import express from 'express';
import * as leadController from '../controllers/leadController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Router-level middleware: skip this router for non-numeric paths
router.use((req, res, next) => {
  const path = req.path;
  const parts = path.split('/').filter(Boolean);

  // Allow root path and numeric ID patterns
  if (parts.length === 0 || /^\d+$/.test(parts[0])) {
    next();
  } else {
    // Skip this router and try the next one
    res.status(404).end();
  }
});

// CRUD operations
router.post('/', authMiddleware, leadController.createLead);
router.get('/', authMiddleware, leadController.getLeads);
// Only match numeric IDs
router.get('/:id', authMiddleware, leadController.getLeadById);
router.put('/:id', authMiddleware, leadController.updateLead);

// Convert lead to client
router.post('/:id/convert-to-client', authMiddleware, leadController.convertLeadToClient);

export default router;
