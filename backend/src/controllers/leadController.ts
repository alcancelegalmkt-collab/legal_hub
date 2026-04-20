import { Response } from 'express';
import { Lead, User, Responsavel, Dependente, Client } from '../models';
import { AuthRequest } from '../middleware/auth';
import { LeadStatus } from '../types/enums';

export const createLead = async (req: AuthRequest, res: Response) => {
  try {
    const {
      legalArea,
      tipoDemanda,
      resumoCaso,
      objetivoCliente,
      urgency,
      possuiDependente,
      responsavel,
      dependentes,
    } = req.body;

    if (!legalArea || !tipoDemanda || !resumoCaso) {
      return res.status(400).json({
        error: 'legalArea, tipoDemanda, and resumoCaso are required',
      });
    }

    if (!responsavel || !responsavel.nomeCompleto || !responsavel.email) {
      return res.status(400).json({
        error: 'Responsavel with nomeCompleto and email is required',
      });
    }

    const lead = await Lead.create({
      legalArea,
      tipoDemanda,
      resumoCaso,
      objetivoCliente: objetivoCliente || '',
      urgency: urgency || 'medium',
      possuiDependente: possuiDependente || false,
      status: LeadStatus.NEW,
      assignedToId: req.userId,
      userId: req.userId!,
    });

    await Responsavel.create({
      leadId: lead.id,
      ...responsavel,
    });

    if (possuiDependente && dependentes && dependentes.length > 0) {
      for (const dep of dependentes) {
        await Dependente.create({
          leadId: lead.id,
          ...dep,
        });
      }
    }

    const fullLead = await Lead.findByPk(lead.id, {
      include: [
        { model: Responsavel, as: 'responsavel' },
        { model: Dependente, as: 'dependentes' },
      ],
    });

    return res.status(201).json(fullLead);
  } catch (error: any) {
    console.error('Erro ao criar lead:', error);
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
        {
          model: Responsavel,
          as: 'responsavel',
        },
        {
          model: Dependente,
          as: 'dependentes',
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
        {
          model: Responsavel,
          as: 'responsavel',
        },
        {
          model: Dependente,
          as: 'dependentes',
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
    const { responsavel, dependentes, ...leadUpdates } = req.body;

    const lead = await Lead.findByPk(id);

    if (!lead) {
      return res.status(404).json({
        error: 'Lead not found',
      });
    }

    await lead.update(leadUpdates);

    if (responsavel) {
      await Responsavel.update(responsavel, {
        where: { leadId: id },
      });
    }

    if (dependentes) {
      await Dependente.destroy({ where: { leadId: id } });
      for (const dep of dependentes) {
        await Dependente.create({
          leadId: id,
          ...dep,
        });
      }
    }

    const updatedLead = await Lead.findByPk(id, {
      include: [
        { model: Responsavel, as: 'responsavel' },
        { model: Dependente, as: 'dependentes' },
      ],
    });

    return res.json(updatedLead);
  } catch (error: any) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const convertLeadToClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { primaryLawyerId } = req.body;

    const lead = await Lead.findByPk(id, {
      include: [{ model: Responsavel, as: 'responsavel' }],
    });

    if (!lead) {
      return res.status(404).json({
        error: 'Lead not found',
      });
    }

    const resp = (lead as any).responsavel;

    const client = await Client.create({
      name: resp.nomeCompleto,
      cpfCnpj: resp.cpf || '',
      email: resp.email,
      phone: resp.telefone || '',
      whatsapp: resp.telefone || '',
      primaryLawyerId: primaryLawyerId || req.userId,
      maritalStatus: resp.estadoCivil || '',
      profession: resp.profissao || '',
      address: resp.endereco || '',
      city: resp.cidade || '',
      state: resp.estado || '',
      zipCode: resp.cep || '',
      rg: resp.rg || '',
      nationality: resp.nacionalidade || '',
      needsFinancialAid: false,
    });

    await lead.update({ status: LeadStatus.CONVERTED });

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

export const deleteLead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findByPk(id);

    if (!lead) {
      return res.status(404).json({
        error: 'Lead not found',
      });
    }

    await lead.destroy();

    return res.json({
      message: 'Lead deleted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
