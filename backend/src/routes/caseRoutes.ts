import express from 'express';
import * as caseController from '../controllers/caseController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// CRUD Básico
router.post('/', caseController.createCase);
router.get('/', caseController.getCases);
router.get('/stats', caseController.getCaseStats);
router.get('/:id', caseController.getCaseById);
router.put('/:id', caseController.updateCase);
router.delete('/:id', caseController.deleteCase);

// Rotas Especiais
router.post('/:id/close', caseController.closeCaseById);

export default router;
