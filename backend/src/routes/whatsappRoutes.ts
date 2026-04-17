import express from 'express';
import * as whatsappController from '../controllers/whatsappController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Rotas protegidas por autenticação
router.use(authMiddleware);

// Enviar mensagem única
router.post('/send', whatsappController.sendMessage);

// Enviar mensagens em massa
router.post('/send-bulk', whatsappController.sendBulkMessages);

// Verificar status da conexão
router.get('/status', whatsappController.getStatus);

// Verificar se está conectado (sem auth)
router.get('/qr-status', (req, res) => {
  res.json({
    connected: true,
    message: 'Verifique /api/whatsapp/status para mais detalhes',
  });
});

export default router;
