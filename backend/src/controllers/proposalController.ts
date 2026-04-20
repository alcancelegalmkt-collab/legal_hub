import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { generateProposal } from '../services/proposalGenerationService';

export const generateProposalPreview = async (req: AuthRequest, res: Response) => {
  try {
    const { leadId } = req.params;
    const { customTerms } = req.body;

    if (!leadId) {
      return res.status(400).json({
        error: 'leadId is required',
      });
    }

    const proposal = await generateProposal(parseInt(leadId), customTerms);

    return res.status(200).json({
      success: true,
      proposalNumber: proposal.proposalNumber,
      date: proposal.date,
      validity: proposal.validity,
      html: proposal.html,
    });
  } catch (error: any) {
    console.error('Erro ao gerar preview da proposta:', error);
    return res.status(400).json({
      error: error.message || 'Erro ao gerar proposta',
    });
  }
};

export const generateProposalPDF = async (req: AuthRequest, res: Response) => {
  try {
    const { leadId } = req.params;
    const { customTerms } = req.body;

    if (!leadId) {
      return res.status(400).json({
        error: 'leadId is required',
      });
    }

    const proposal = await generateProposal(parseInt(leadId), customTerms);

    // For now, return HTML that can be printed/converted to PDF
    // In production, use puppeteer or html-to-pdf to generate actual PDF
    return res.setHeader('Content-Type', 'text/html').status(200).send(proposal.html);
  } catch (error: any) {
    console.error('Erro ao gerar PDF da proposta:', error);
    return res.status(400).json({
      error: error.message || 'Erro ao gerar proposta',
    });
  }
};

export const sendProposalByEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { leadId } = req.params;
    const { recipientEmail, customTerms } = req.body;

    if (!leadId || !recipientEmail) {
      return res.status(400).json({
        error: 'leadId and recipientEmail are required',
      });
    }

    const proposal = await generateProposal(parseInt(leadId), customTerms);

    // TODO: Integrate with email service to send proposal HTML
    // For now, return success response
    return res.status(200).json({
      success: true,
      message: `Proposta ${proposal.proposalNumber} enviada para ${recipientEmail}`,
      proposalNumber: proposal.proposalNumber,
    });
  } catch (error: any) {
    console.error('Erro ao enviar proposta por email:', error);
    return res.status(400).json({
      error: error.message || 'Erro ao enviar proposta',
    });
  }
};

export const sendProposalByWhatsApp = async (req: AuthRequest, res: Response) => {
  try {
    const { leadId } = req.params;
    const { recipientPhone, customTerms } = req.body;

    if (!leadId || !recipientPhone) {
      return res.status(400).json({
        error: 'leadId and recipientPhone are required',
      });
    }

    const proposal = await generateProposal(parseInt(leadId), customTerms);

    // TODO: Integrate with WhatsApp service to send proposal link
    // For now, return success response
    return res.status(200).json({
      success: true,
      message: `Proposta ${proposal.proposalNumber} enviada para ${recipientPhone} via WhatsApp`,
      proposalNumber: proposal.proposalNumber,
    });
  } catch (error: any) {
    console.error('Erro ao enviar proposta por WhatsApp:', error);
    return res.status(400).json({
      error: error.message || 'Erro ao enviar proposta',
    });
  }
};

export default {
  generateProposalPreview,
  generateProposalPDF,
  sendProposalByEmail,
  sendProposalByWhatsApp,
};
