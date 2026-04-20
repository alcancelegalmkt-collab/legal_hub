import express from 'express';
import {
  buscarProcesso,
  sincronizarTodos,
  sincronizarCaso,
  obterStatus,
  obterHealth,
} from '../controllers/escavadorController';
import {
  listarMovimentacoes,
  obterMovimentacoesPorCaso,
  obterStats,
} from '../controllers/movimentacaoController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// GET /api/escavador/health - Verificar configuração do Escavador
router.get('/health', authMiddleware, obterHealth);

// GET /api/escavador/processo/:numero - Buscar processo específico
router.get('/processo/:numero', authMiddleware, buscarProcesso);

// GET /api/escavador/sync - Sincronizar todos os casos ativos
router.get('/sync', authMiddleware, sincronizarTodos);

// GET /api/escavador/sync/:caseId - Sincronizar caso específico
router.get('/sync/:caseId', authMiddleware, sincronizarCaso);

// GET /api/escavador/status/:caseId - Obter status da última sincronização
router.get('/status/:caseId', authMiddleware, obterStatus);

// GET /api/escavador/movimentacoes - Listar todas as movimentações com filtros
router.get('/movimentacoes', authMiddleware, listarMovimentacoes);

// GET /api/escavador/movimentacoes/stats - Obter estatísticas das movimentações
router.get('/movimentacoes/stats', authMiddleware, obterStats);

// GET /api/escavador/movimentacoes/:caseId - Obter movimentações de um caso específico
router.get('/movimentacoes/:caseId', authMiddleware, obterMovimentacoesPorCaso);

export default router;
