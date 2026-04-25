import express from 'express';
import { authMiddleware } from '../middleware/auth';
import * as whatsappInboxController from '../controllers/whatsappInboxController';

const router = express.Router();

router.use(authMiddleware);

router.get('/conversations', whatsappInboxController.listConversations);
router.post('/conversations', whatsappInboxController.createConversation);
router.get('/conversations/:id', whatsappInboxController.getConversationById);
router.post('/conversations/:id/messages', whatsappInboxController.addOutgoingMessage);
router.post('/conversations/:id/internal-notes', whatsappInboxController.addInternalNote);
router.get('/tags', whatsappInboxController.listTags);

export default router;
