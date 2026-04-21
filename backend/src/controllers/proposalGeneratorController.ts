import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ProposalGeneratorService, DocumentType, ProposalGeneratorInput } from '../services/proposalGeneratorService';

/**
 * POST /api/proposals/generate
 * Generate legal documents for a lead/client
 */
export const generateProposals = async (req: AuthRequest, res: Response) => {
  try {
    const { leadId, clientId, documentTypes, locale } = req.body;

    const input: ProposalGeneratorInput = {
      leadId,
      clientId,
      documentTypes: documentTypes || [
        DocumentType.PROPOSAL,
        DocumentType.SERVICE_AGREEMENT,
      ],
      locale: locale || 'pt-BR',
      outputFormat: 'docx',
    };

    // Validate input
    const validation = ProposalGeneratorService.validateInput(input);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validação falhou',
        details: validation.errors,
      });
    }

    // Generate documents
    const documents = await ProposalGeneratorService.generateDocuments(input);

    if (documents.length === 0) {
      return res.status(400).json({
        error: 'Nenhum documento foi gerado',
      });
    }

    // If single document, return it directly
    if (documents.length === 1) {
      const doc = documents[0];
      res.setHeader('Content-Disposition', `attachment; filename="${doc.filename}"`);
      res.setHeader('Content-Type', doc.contentType);
      return res.send(doc.content);
    }

    // If multiple documents, return metadata
    return res.status(200).json({
      message: 'Documentos gerados com sucesso',
      count: documents.length,
      documents: documents.map((doc) => ({
        type: doc.type,
        filename: doc.filename,
        contentType: doc.contentType,
        generatedAt: doc.generatedAt,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao gerar propostas:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao gerar propostas',
    });
  }
};

/**
 * GET /api/proposals/download/:leadId/:documentType
 * Download a specific generated document
 */
export const downloadProposal = async (req: AuthRequest, res: Response) => {
  try {
    const { leadId, documentType } = req.params;

    const input: ProposalGeneratorInput = {
      leadId: Number(leadId),
      documentTypes: [documentType as DocumentType],
      locale: 'pt-BR',
      outputFormat: 'docx',
    };

    // Validate input
    const validation = ProposalGeneratorService.validateInput(input);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validação falhou',
        details: validation.errors,
      });
    }

    // Generate document
    const documents = await ProposalGeneratorService.generateDocuments(input);

    if (documents.length === 0) {
      return res.status(404).json({
        error: 'Documento não encontrado',
      });
    }

    const doc = documents[0];
    res.setHeader('Content-Disposition', `attachment; filename="${doc.filename}"`);
    res.setHeader('Content-Type', doc.contentType);
    return res.send(doc.content);
  } catch (error: any) {
    console.error('Erro ao baixar proposta:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao baixar proposta',
    });
  }
};

/**
 * POST /api/proposals/:leadId/preview/:documentType
 * Preview a document without downloading
 */
export const previewProposal = async (req: AuthRequest, res: Response) => {
  try {
    const { leadId, documentType } = req.params;

    const input: ProposalGeneratorInput = {
      leadId: Number(leadId),
      documentTypes: [documentType as DocumentType],
      locale: 'pt-BR',
      outputFormat: 'docx',
    };

    // Validate input
    const validation = ProposalGeneratorService.validateInput(input);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validação falhou',
        details: validation.errors,
      });
    }

    // Generate document
    const documents = await ProposalGeneratorService.generateDocuments(input);

    if (documents.length === 0) {
      return res.status(404).json({
        error: 'Documento não encontrado',
      });
    }

    const doc = documents[0];
    return res.status(200).json({
      message: 'Documento disponível para visualização',
      document: {
        type: doc.type,
        filename: doc.filename,
        contentType: doc.contentType,
        generatedAt: doc.generatedAt,
        size: doc.content.length,
      },
    });
  } catch (error: any) {
    console.error('Erro ao visualizar proposta:', error);
    return res.status(500).json({
      error: error.message || 'Erro ao visualizar proposta',
    });
  }
};

/**
 * GET /api/proposals/document-types
 * Get available document types
 */
export const getDocumentTypes = (_req: AuthRequest, res: Response) => {
  const types = Object.values(DocumentType).map((type) => ({
    value: type,
    label: formatDocumentTypeLabel(type),
  }));

  return res.json({
    documentTypes: types,
  });
};

/**
 * Format document type label for display
 */
function formatDocumentTypeLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    [DocumentType.PROPOSAL]: 'Proposta de Honorários',
    [DocumentType.SERVICE_AGREEMENT]: 'Contrato de Prestação de Serviços',
    [DocumentType.POWER_OF_ATTORNEY]: 'Procuração',
    [DocumentType.FINANCIAL_HARDSHIP]: 'Declaração de Hipossuficiência',
  };
  return labels[type];
}
