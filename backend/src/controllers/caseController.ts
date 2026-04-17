import { Response } from 'express';
import { Case, Client, User } from '../models';
import { AuthRequest } from '../middleware/auth';

export const createCase = async (req: AuthRequest, res: Response) => {
  try {
    const {
      clientId,
      primaryLawyerId,
      title,
      legalArea,
      description,
      caseNumber,
      court,
      caseValue,
      honorariesFee,
      honorariesFeeType,
      opposingParties,
    } = req.body;

    if (!clientId || !title || !legalArea || !honorariesFee) {
      return res.status(400).json({
        error: 'clientId, title, legalArea e honorariesFee são obrigatórios',
      });
    }

    // Verificar se cliente existe
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado',
      });
    }

    const newCase = await Case.create({
      clientId,
      primaryLawyerId: primaryLawyerId || req.userId,
      title,
      legalArea,
      description,
      caseNumber,
      court,
      caseValue,
      honorariesFee,
      honorariesFeeType: honorariesFeeType || 'fixed',
      opposingParties,
      status: 'active',
    });

    return res.status(201).json(newCase);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getCases = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status, legalArea, clientId } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const where: any = {};
    if (status) where.status = status;
    if (legalArea) where.legalArea = legalArea;
    if (clientId) where.clientId = clientId;

    const { count, rows } = await Case.findAndCountAll({
      where,
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'cpfCnpj', 'email'],
        },
        {
          model: User,
          as: 'lawyer',
          attributes: ['id', 'name', 'email', 'oabNumber'],
        },
      ],
      offset,
      limit: limit as number,
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      cases: rows,
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

export const getCaseById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const newCase = await Case.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'cpfCnpj', 'email', 'phone'],
        },
        {
          model: User,
          as: 'lawyer',
          attributes: ['id', 'name', 'email', 'oabNumber'],
        },
      ],
    });

    if (!newCase) {
      return res.status(404).json({
        error: 'Caso não encontrado',
      });
    }

    return res.json(newCase);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const updateCase = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const newCase = await Case.findByPk(id);

    if (!newCase) {
      return res.status(404).json({
        error: 'Caso não encontrado',
      });
    }

    await newCase.update(updates);

    return res.json(newCase);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const deleteCase = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const newCase = await Case.findByPk(id);

    if (!newCase) {
      return res.status(404).json({
        error: 'Caso não encontrado',
      });
    }

    await newCase.destroy();

    return res.json({
      message: 'Caso deletado com sucesso',
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const getCaseStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await Case.findAll({
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    return res.json({
      stats,
      timestamp: new Date(),
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const closeCaseById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { endDate } = req.body;

    const newCase = await Case.findByPk(id);

    if (!newCase) {
      return res.status(404).json({
        error: 'Caso não encontrado',
      });
    }

    await newCase.update({
      status: 'closed',
      endDate: endDate || new Date(),
    });

    return res.json({
      message: 'Caso fechado com sucesso',
      case: newCase,
    });
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};
