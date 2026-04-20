import { Response } from 'express';
import { Lead, User } from '../models';
import { AuthRequest } from '../middleware/auth';

export const createLead = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      whatsapp,
      legalArea,
      description,
      urgency,
      estimatedBudget,
      source,
    } = req.body;

    if (!name || !email || !legalArea) {
      return res.status(400).json({
        error: 'Name, email, and legalArea are required',
      });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      whatsapp,
      legalArea,
      description,
      urgency: urgency || 'medium',
      estimatedBudget,
      source: source || 'whatsapp',
      status: 'new',
      aiQualificationScore: 0,
      notes: '',
    });

    return res.status(201).json(lead);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getLeads = async (req: AuthRequest, res: Response) => {
  try {
    const { status, legalArea, page = 1, limit = 20 } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const where: any = {};
    if (status) where.status = status;
    if (legalArea) where.legalArea = legalArea;

    const { count, rows } = await Lead.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email'],
        },
      ],
      offset,
      limit: limit as number,
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      leads: rows,
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

export const getLeadById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!lead) {
      return res.status(404).json({
        error: 'Lead not found',
      });
    }

    return res.json(lead);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

export const updateLead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const lead = await Lead.findByPk(id);

    if (!lead) {
      return res.status(404).json({
        error: 'Lead not found',
      });
    }

    await lead.update(updates);

    return res.json(lead);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const convertLeadToClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { primaryLawyerId, ...clientData } = req.body;

    const lead = await Lead.findByPk(id);

    if (!lead) {
      return res.status(404).json({
        error: 'Lead not found',
      });
    }

    const { Client } = await import('../models');

    const client = await Client.create({
      name: lead.name,
      cpfCnpj: clientData.cpfCnpj,
      email: lead.email,
      phone: lead.phone,
      whatsapp: lead.whatsapp,
      primaryLawyerId: primaryLawyerId || req.userId,
      ...clientData,
    });

    await lead.update({ status: 'converted' });

    return res.status(201).json({
      message: 'Lead converted to client successfully',
      client,
    });
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};
