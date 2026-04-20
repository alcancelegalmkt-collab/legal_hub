import express from 'express';
import {
  handleN8nWebhook,
  triggerCaseUpdate,
  triggerDocumentSigned,
  triggerNewClient,
  getN8nWorkflowExamples,
  webhookHealth,
} from '../controllers/webhookController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Health check (sem autenticação)
router.get('/health', webhookHealth);

// Webhook recebido DO n8n (sem autenticação - n8n chama)
router.post('/n8n-action', handleN8nWebhook);

// Triggers que disparam webhook PARA n8n (com autenticação)
router.post('/case-update', authMiddleware, triggerCaseUpdate);
router.post('/document-signed', authMiddleware, triggerDocumentSigned);
router.post('/client-created', authMiddleware, triggerNewClient);

// Obter exemplos de workflows
router.get('/workflows', authMiddleware, getN8nWorkflowExamples);

export default router;
