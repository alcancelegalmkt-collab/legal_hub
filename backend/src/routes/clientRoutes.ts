import express from 'express';
import * as clientController from '../controllers/clientController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// CRUD Básico
router.post('/', clientController.createClient);
router.get('/', clientController.getClients);
router.get('/:id', clientController.getClientById);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

// Rotas Especiais
router.get('/:id/with-cases', clientController.getClientWithCases);

export default router;
