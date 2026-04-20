import { Response } from 'express';
import { Document, Client, Case } from '../models';
import { AuthRequest } from '../middleware/auth';

export const createDocument = async (req: AuthRequest, res: Response) => {
  try {
    const {
      clientId,
      caseId,
      type,
      title,
      fileName,
      filePath,
      fileUrl,
    } = req.body;

    if (!clientId || !type || !title || !fileName || !filePath) {
      return res.status(400).json({
        error: 'clientId, type, title, fileName e filePath são obrigatórios',
      });
    }

    // Verificar se cliente existe
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado',
      });
    }

    // Se caseId fornecido, verificar se existe
    if (caseId) {
      const caseExists = await Case.findByPk(caseId);
      if (!caseExists) {
        return res.status(404).json({
          error: 'Caso não encontrado',
        });
      }
    }

    const document = await Document.create({
      clientId,
      caseId,
      type,
      title,
      fileName,
      filePath,
      fileUrl,
      status: 'draft',
    });

    return res.status(201).json(document);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, clientId, caseId, type, status } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (caseId) where.caseId = caseId;
    if (type) where.type = type;
    if (status) where.status = status;

    const { count, rows } = await Document.findAndCountAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'cpfCnpj', 'email'],
        },
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title', 'legalArea'],
        },
      ],
      offset,
      limit: limit as number,
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      documents: rows,
      total: count,
      page,
      limit,
      pages: Math.ceil(count / (limit as number)),
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const getDocumentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'cpfCnpj', 'email', 'phone'],
        },
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title', 'legalArea', 'caseNumber'],
        },
      ],
    });

    if (!document) {
      return res.status(404).json({
        error: 'Documento não encontrado',
      });
    }

    return res.json(document);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const updateDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({
        error: 'Documento não encontrado',
      });
    }

    await document.update(updates);

    return res.json(document);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({
        error: 'Documento não encontrado',
      });
    }

    await document.destroy();

    return res.json({
      message: 'Documento deletado com sucesso',
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const sendToSignature = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { zapsignId, zapsignSignLink } = req.body;

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({
        error: 'Documento não encontrado',
      });
    }

    await document.update({
      status: 'pending_signature',
      zapsignId,
      zapsignSignLink,
    });

    return res.json({
      message: 'Documento enviado para assinatura',
      document,
    });
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const markAsSigned = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { signedBy } = req.body;

    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({
        error: 'Documento não encontrado',
      });
    }

    await document.update({
      status: 'signed',
      signedAt: new Date(),
      signedBy,
    });

    return res.json({
      message: 'Documento marcado como assinado',
      document,
    });
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getDocumentsByClient = async (req: AuthRequest, res: Response) => {
  try {
    const { clientId } = req.params;

    const documents = await Document.findAll({
      where: { clientId },
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'title', 'legalArea'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      clientId,
      documents,
      total: documents.length,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const getDocumentStats = async (_req: AuthRequest, res: Response) => {
  try {
    const stats = await Document.findAll({
      attributes: [
        'type',
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['type', 'status'],
      raw: true,
    });

    const byStatus = await Document.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    return res.json({
      byType: stats,
      byStatus,
      timestamp: new Date(),
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
