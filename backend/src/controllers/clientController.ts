import { Response } from 'express';
import { Client, User } from '../models';
import { AuthRequest } from '../middleware/auth';

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      cpfCnpj,
      email,
      phone,
      whatsapp,
      maritalStatus,
      profession,
      address,
      city,
      state,
      zipCode,
      rg,
      nationality,
      needsFinancialAid,
      primaryLawyerId,
    } = req.body;

    if (!name || !cpfCnpj || !email) {
      return res.status(400).json({
        error: 'Nome, CPF/CNPJ e email são obrigatórios',
      });
    }

    // Verificar se cliente já existe
    const existingClient = await Client.findOne({ where: { cpfCnpj } });
    if (existingClient) {
      return res.status(400).json({
        error: 'Cliente com este CPF/CNPJ já existe',
      });
    }

    const client = await Client.create({
      name,
      cpfCnpj,
      email,
      phone,
      whatsapp,
      maritalStatus,
      profession,
      address,
      city,
      state,
      zipCode,
      rg,
      nationality,
      needsFinancialAid: needsFinancialAid || false,
      primaryLawyerId: primaryLawyerId || req.userId,
    });

    return res.status(201).json(client);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getClients = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const where: any = {};
    if (search) {
      where[require('sequelize').Op.or] = [
        { name: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { email: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { cpfCnpj: { [require('sequelize').Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Client.findAndCountAll({
      where,
      include: [
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
      clients: rows,
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

export const getClientById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id, {
      include: [
        {
          model: User,
          as: 'lawyer',
          attributes: ['id', 'name', 'email', 'oabNumber'],
        },
      ],
    });

    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado',
      });
    }

    return res.json(client);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado',
      });
    }

    await client.update(updates);

    return res.json(client);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado',
      });
    }

    await client.destroy();

    return res.json({
      message: 'Cliente deletado com sucesso',
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const getClientWithCases = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { Case } = await import('../models');

    const client = await Client.findByPk(id, {
      include: [
        {
          model: User,
          as: 'lawyer',
          attributes: ['id', 'name', 'email', 'oabNumber'],
        },
        {
          model: Case,
          as: 'cases',
          attributes: [
            'id',
            'title',
            'legalAreaId',
            'status',
            'caseValue',
            'startDate',
          ],
        },
      ],
    });

    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado',
      });
    }

    return res.json(client);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
