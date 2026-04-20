import { Request, Response } from 'express';
// import escavadorService from '../services/escavadorService'; // TODO: Re-enable when service is fixed
const escavadorService: any = {};

export const buscarProcesso = async (req: Request, res: Response) => {
  try {
    const {numero } = req.params;

    if (!numero) {
      return res.status(400).json({
        error: 'Process number is required',
      });
    }

    const processo = await escavadorService.buscarProcesso(numero);

    if (!processo) {
      return res.status(404).json({
        success: false,
        message: `Processo ${numero} não encontrado no Escavador`,
      });
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      processo,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar processo:', error);
    return res.status(500).json({
      error: 'Failed to search process',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const sincronizarTodos = async (__req: Request, res: Response) => {
  try {
    console.log('🔄 Iniciando sincronização manual de todos os processos...');

    const resultado = await escavadorService.sincronizarProcessos();

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      message: `Sincronização concluída: ${resultado.sincronizados} sincronizados, ${resultado.comAtualizacoes} com atualizações, ${resultado.erros} erros`,
      resultado,
    });
  } catch (error) {
    console.error('❌ Erro ao sincronizar processos:', error);
    return res.status(500).json({
      error: 'Failed to synchronize processes',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const sincronizarCaso = async (req: Request, res: Response) => {
  try {
    const {caseId } = req.params;

    if (!caseId) {
      return res.status(400).json({
        error: 'Case ID is required',
      });
    }

    const { Case } = await import('../models');
    const caseItem = await Case.findByPk(parseInt(caseId));

    if (!caseItem) {
      return res.status(404).json({
        error: `Case ${caseId} not found`,
      });
    }

    const numeroProcesso = (caseItem as any).processNumber;
    if (!numeroProcesso) {
      return res.status(400).json({
        error: `Case ${caseId} does not have a process number`,
      });
    }

    const processo = await escavadorService.buscarProcesso(numeroProcesso);

    if (!processo) {
      return res.status(404).json({
        success: false,
        message: `Processo ${numeroProcesso} não encontrado no Escavador`,
      });
    }

    // Atualizar caso com dados do Escavador
    await (caseItem as any).update({
      lastSyncedAt: new Date(),
      escavadorData: JSON.stringify(processo),
    });

    console.log(`✅ Caso ${caseId} sincronizado com sucesso`);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      message: `Caso ${caseId} sincronizado com sucesso`,
      processo,
    });
  } catch (error) {
    console.error('❌ Erro ao sincronizar caso:', error);
    return res.status(500).json({
      error: 'Failed to synchronize case',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const obterStatus = async (req: Request, res: Response) => {
  try {
    const {caseId } = req.params;

    if (!caseId) {
      return res.status(400).json({
        error: 'Case ID is required',
      });
    }

    const status = escavadorService.getLastSyncStatus(parseInt(caseId));

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      caseId: parseInt(caseId),
      status,
    });
  } catch (error) {
    console.error('❌ Erro ao obter status de sincronização:', error);
    return res.status(500).json({
      error: 'Failed to get sync status',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const obterHealth = async (__req: Request, res: Response) => {
  try {
    const token = process.env.ESCAVADOR_API_KEY;

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      escavador: {
        configured: !!token,
        apiUrl: 'https://api.escavador.com.br/api/v2',
        status: token ? 'ready' : 'not configured',
      },
    });
  } catch (error) {
    console.error('❌ Erro ao verificar health:', error);
    return res.status(500).json({
      error: 'Failed to get health status',
    });
  }
};
