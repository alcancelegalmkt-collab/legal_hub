import express from 'express';
import * as documentController from '../controllers/documentController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// CRUD Básico
router.post('/', documentController.createDocument);
router.get('/', documentController.getDocuments);
router.get('/stats', documentController.getDocumentStats);
router.get('/:id', documentController.getDocumentById);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

// Rotas Especiais
router.post('/:id/send-to-signature', documentController.sendToSignature);
router.post('/:id/mark-as-signed', documentController.markAsSigned);
router.get('/client/:clientId', documentController.getDocumentsByClient);

export default router;
