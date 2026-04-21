import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { LeadCompleteCreationService } from '../services/leadCompleteCreationService';

/**
 * POST /leads/complete
 * Create a complete lead with all 7 blocks in a single transaction
 */
export const createCompleteLead = async (req: AuthRequest, res: Response) => {
  try {
    const payload = req.body;

    // Validate required fields
    if (!payload.responsavel || !payload.leadDetails || !payload.honoraryStructure) {
      return res.status(400).json({
        error: 'Missing required blocks: responsavel, leadDetails, honoraryStructure',
      });
    }

    // Validate Block 1 (Responsavel)
    const { nomeCompleto, cpf, email, telefone, endereco, cidade, estado, cep } = payload.responsavel;
    if (!nomeCompleto || !cpf || !email || !telefone || !endereco || !cidade || !estado || !cep) {
      return res.status(400).json({
        error: 'Block 1 (Responsavel) missing required fields',
      });
    }

    // Validate Block 2 (LeadDetails)
    const { legalAreaId, caseTypeId, tipoDemanda, resumoCaso, objetivoCliente } = payload.leadDetails;
    if (!legalAreaId || !caseTypeId || !tipoDemanda || !resumoCaso || !objetivoCliente) {
      return res.status(400).json({
        error: 'Block 2 (LeadDetails) missing required fields',
      });
    }

    // Validate Block 4 (HonoraryStructure)
    const { honoraryType } = payload.honoraryStructure;
    if (!honoraryType) {
      return res.status(400).json({
        error: 'Block 4 (HonoraryStructure) missing honoraryType',
      });
    }

    // Validate Block 6 (Acceptance)
    const { acceptanceMethod, acceptedAt } = payload.acceptance || {};
    if (!acceptanceMethod || !acceptedAt) {
      return res.status(400).json({
        error: 'Block 6 (Acceptance) missing required fields',
      });
    }

    // Validate Block 7 (Financial) - totalValue is optional, will be calculated if not provided
    const { totalValue, paidValue } = payload.financialRecord || {};
    if (totalValue && totalValue <= 0) {
      return res.status(400).json({
        error: 'Block 7 (Financial) totalValue must be greater than 0',
      });
    }
    if (paidValue && paidValue < 0) {
      return res.status(400).json({
        error: 'Block 7 (Financial) paidValue cannot be negative',
      });
    }

    // Create the complete lead
    const result = await LeadCompleteCreationService.createCompleteLead(payload, req.userId!);

    return res.status(201).json({
      message: 'Lead criado com sucesso',
      data: {
        lead: {
          id: result.lead.id,
          status: result.lead.status,
          proposalNumber: result.proposal.proposalNumber,
        },
        client: result.client
          ? {
              id: result.client.id,
              name: result.client.name,
            }
          : null,
        financialRecord: {
          id: result.financialRecord.id,
          totalValue: result.financialRecord.totalValue,
          pendingValue: result.financialRecord.pendingValue,
        },
      },
    });
  } catch (error: any) {
    console.error('Erro ao criar lead completo:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao criar lead',
    });
  }
};

/**
 * GET /leads/legal-areas
 * Get all legal areas for form dropdown
 */
export const getLegalAreas = async (_req: AuthRequest, res: Response) => {
  try {
    console.log('[getLegalAreas] Called');
    const { LegalArea } = await import('../models');

    const areas = await LegalArea.findAll({
      order: [['name', 'ASC']],
    });

    console.log('[getLegalAreas] Found', areas.length, 'areas');
    return res.json(areas);
  } catch (error: any) {
    console.error('Erro ao buscar áreas jurídicas:', error);
    return res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * GET /case-types?legalAreaId=X
 * Get case types for a specific legal area
 */
export const getCaseTypesByArea = async (req: AuthRequest, res: Response) => {
  try {
    const { legalAreaId } = req.query;

    if (!legalAreaId) {
      return res.status(400).json({
        error: 'legalAreaId query parameter required',
      });
    }

    const { CaseType } = await import('../models');

    const caseTypes = await CaseType.findAll({
      where: { legalAreaId: Number(legalAreaId) },
      order: [['name', 'ASC']],
    });

    return res.json(caseTypes);
  } catch (error: any) {
    console.error('Erro ao buscar tipos de caso:', error);
    return res.status(500).json({
      error: error.message,
    });
  }
};
