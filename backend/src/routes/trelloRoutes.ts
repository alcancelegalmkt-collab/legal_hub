import express from 'express';
import * as trelloController from '../controllers/trelloController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Boards
router.get('/boards', trelloController.getBoards);
router.get('/boards/:boardId/lists', trelloController.getListsInBoard);

// Cards - Documentos
router.post('/documents/card', trelloController.createDocumentCard);
router.put('/cards/:cardId', trelloController.updateCard);

// Cards - Casos
router.post('/cases/card', trelloController.createCaseCard);

// Actions on Cards
router.post('/cards/:cardId/comments', trelloController.addCommentToCard);
router.post('/cards/:cardId/members', trelloController.addMemberToCard);
router.post('/cards/:cardId/checklists', trelloController.addChecklistToCard);

export default router;
