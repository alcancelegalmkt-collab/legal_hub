import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { LeadToClientConversionService } from '../services/leadToClientConversionService';
import { AcceptanceMethod } from '../types/enums';

/**
 * POST /api/leads/:leadId/convert
 * Manually trigger lead to client conversion
 */
export const convertLeadToClient = async (req: AuthRequest, res: Response) => {
  try {
    const { leadId } = req.params;
    const { acceptanceMethod } = req.body;

    if (!leadId || isNaN(Number(leadId))) {
      return res.status(400).json({
        error: 'leadId inválido',
      });
    }

    const result = await LeadToClientConversionService.convertLeadToClientManual(
      Number(leadId),
      acceptanceMethod || AcceptanceMethod.DIGITAL
    );

    if (!result.success) {
      return res.status(400).json({
        error: 'Falha na conversão',
        ...result,
      });
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Erro ao converter lead:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao converter lead',
    });
  }
};

/**
 * POST /api/leads/:leadId/convert-on-acceptance
 * Automatic trigger when proposal is accepted
 * Called from ProposalAcceptance webhook
 */
export const convertOnProposalAcceptance = async (req: AuthRequest, res: Response) => {
  try {
    const { leadId, proposalAcceptanceId } = req.body;

    if (!leadId || !proposalAcceptanceId) {
      return res.status(400).json({
        error: 'leadId e proposalAcceptanceId são obrigatórios',
      });
    }

    const result = await LeadToClientConversionService.convertLeadToClientOnAcceptance(
      leadId,
      proposalAcceptanceId
    );

    if (!result.success) {
      return res.status(400).json({
        error: 'Falha na conversão automática',
        ...result,
      });
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Erro na conversão automática:', error);
    return res.status(500).json({
      error: error.message || 'Erro na conversão',
    });
  }
};

/**
 * GET /api/leads/:leadId/conversion-status
 * Check if lead is converted to client
 */
export const getConversionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { leadId } = req.params;

    if (!leadId || isNaN(Number(leadId))) {
      return res.status(400).json({
        error: 'leadId inválido',
      });
    }

    const status = await LeadToClientConversionService.getConversionStatus(Number(leadId));

    return res.json(status);
  } catch (error: any) {
    console.error('Erro ao verificar status:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao verificar status',
    });
  }
};

/**
 * GET /api/leads/unconverted
 * Get list of unconverted leads
 */
export const getUnconvertedLeads = async (req: AuthRequest, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 50;

    const leads = await LeadToClientConversionService.findUnconvertedLeads(limit);

    return res.json({
      total: leads.length,
      leads: leads.map((lead) => ({
        id: lead.id,
        status: lead.status,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao listar leads não convertidos:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao listar leads',
    });
  }
};

/**
 * GET /api/leads/accepted-not-converted
 * Get leads that have accepted proposals but aren't converted
 */
export const getAcceptedButNotConvertedLeads = async (_req: AuthRequest, res: Response) => {
  try {
    const leads = await LeadToClientConversionService.findAcceptedButNotConvertedLeads();

    return res.json({
      total: leads.length,
      leads: leads.map((lead) => ({
        id: lead.id,
        status: lead.status,
        createdAt: lead.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao listar leads aceitos não convertidos:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao listar leads',
    });
  }
};

/**
 * POST /api/leads/auto-convert
 * Auto-convert all accepted leads (batch operation)
 */
export const autoConvertAcceptedLeads = async (_req: AuthRequest, res: Response) => {
  try {
    const result = await LeadToClientConversionService.autoConvertAcceptedLeads();

    return res.json({
      message: 'Conversão automática concluída',
      ...result,
    });
  } catch (error: any) {
    console.error('Erro na conversão em lote:', error);
    return res.status(500).json({
      error: error.message || 'Erro na conversão em lote',
    });
  }
};

/**
 * POST /api/leads/batch-convert
 * Convert multiple leads at once
 */
export const batchConvertLeads = async (req: AuthRequest, res: Response) => {
  try {
    const { leadIds } = req.body;

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({
        error: 'leadIds deve ser um array não vazio',
      });
    }

    const results = await LeadToClientConversionService.batchConvertLeads(leadIds);

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return res.json({
      message: 'Conversão em lote concluída',
      total: results.length,
      successful,
      failed,
      results,
    });
  } catch (error: any) {
    console.error('Erro na conversão em lote:', error);
    return res.status(500).json({
      error: error.message || 'Erro na conversão',
    });
  }
};

/**
 * DELETE /api/leads/:leadId/revert-conversion
 * Revert lead conversion (testing/recovery only)
 */
export const revertConversion = async (req: AuthRequest, res: Response) => {
  try {
    const { leadId } = req.params;

    if (!leadId || isNaN(Number(leadId))) {
      return res.status(400).json({
        error: 'leadId inválido',
      });
    }

    await LeadToClientConversionService.revertConversion(Number(leadId));

    return res.json({
      message: 'Conversão revertida com sucesso',
      leadId: Number(leadId),
    });
  } catch (error: any) {
    console.error('Erro ao reverter conversão:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao reverter',
    });
  }
};
