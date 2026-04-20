import express from 'express';
import * as documentController from '../controllers/documentController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas Especiais (devem vir antes de /:id)
// router.post('/generate', documentController.generateDocumentAI);
router.get('/stats', documentController.getDocumentStats);
router.get('/client/:clientId', documentController.getDocumentsByClient);

// CRUD Básico
router.post('/', documentController.createDocument);
router.get('/', documentController.getDocuments);
router.get('/:id', documentController.getDocumentById);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

// Rotas de Assinatura (compatibilidade com sistema antigo)
router.post('/:id/send-to-signature', documentController.sendToSignature);
router.post('/:id/mark-as-signed', documentController.markAsSigned);

// Rotas ZapSign (TODO: Implementar funções faltantes)
// router.post('/:id/send-to-zapsign', documentController.sendToZapSign);
// router.get('/:id/zapsign-status', documentController.checkZapSignStatus);
// router.post('/check-signatures', documentController.checkAllPendingSignatures);

// Webhook ZapSign (sem autenticação)
// router.post('/webhook/zapsign', documentController.handleZapSignWebhook);

export default router;
