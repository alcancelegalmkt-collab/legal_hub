import express from 'express';
import * as leadController from '../controllers/leadController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// CRUD operations
router.post('/', leadController.createLead);
router.get('/', leadController.getLeads);
router.get('/:id', leadController.getLeadById);
router.put('/:id', leadController.updateLead);

// Convert lead to client
router.post('/:id/convert-to-client', leadController.convertLeadToClient);

export default router;
