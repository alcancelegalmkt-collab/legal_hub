import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth';
import WhatsAppConversation from '../models/WhatsAppConversation';
import WhatsAppMessage from '../models/WhatsAppMessage';
import WhatsAppTag from '../models/WhatsAppTag';
import WhatsAppInternalNote from '../models/WhatsAppInternalNote';
import User from '../models/User';

export const listConversations = async (req: AuthRequest, res: Response) => {
  try {
    const { status, assignedUserId, search } = req.query;

    const where: any = {};

    if (typeof status === 'string' && status.length > 0) {
      where.status = status;
    }

    if (typeof assignedUserId === 'string' && assignedUserId.length > 0) {
      where.assignedUserId = Number(assignedUserId);
    }

    if (typeof search === 'string' && search.trim().length > 0) {
      where[Op.or] = [
        { contactName: { [Op.iLike]: `%${search.trim()}%` } },
        { phoneNumber: { [Op.iLike]: `%${search.trim()}%` } },
      ];
    }

    const conversations = await WhatsAppConversation.findAll({
      where,
      include: [
        { model: WhatsAppTag, as: 'tags', through: { attributes: [] } },
        { model: User, as: 'assignedUser', attributes: ['id', 'name', 'email'] },
      ],
      order: [['lastMessageAt', 'DESC NULLS LAST'], ['updatedAt', 'DESC']],
    });

    return res.json({ conversations });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getConversationById = async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await WhatsAppConversation.findByPk(req.params.id, {
      include: [
        { model: WhatsAppMessage, as: 'messages', separate: true, order: [['sentAt', 'ASC']] },
        { model: WhatsAppInternalNote, as: 'internalNotes', separate: true, order: [['createdAt', 'DESC']] },
        { model: WhatsAppTag, as: 'tags', through: { attributes: [] } },
      ],
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }

    return res.json({ conversation });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const createConversation = async (req: AuthRequest, res: Response) => {
  try {
    const { contactName, phoneNumber, leadId, clientId, assignedUserId, origin } = req.body;

    if (!contactName || !phoneNumber) {
      return res.status(400).json({ error: 'contactName e phoneNumber são obrigatórios' });
    }

    const conversation = await WhatsAppConversation.create({
      contactName,
      phoneNumber,
      leadId: leadId ?? null,
      clientId: clientId ?? null,
      assignedUserId: assignedUserId ?? req.userId ?? null,
      origin: origin ?? 'manual',
      status: 'open',
      pipelineStage: 'novo_lead',
    });

    return res.status(201).json({ conversation });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const addInternalNote = async (req: AuthRequest, res: Response) => {
  try {
    const { note } = req.body;
    const conversationId = Number(req.params.id);

    if (!note) {
      return res.status(400).json({ error: 'note é obrigatório' });
    }

    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const internalNote = await WhatsAppInternalNote.create({
      conversationId,
      userId: req.userId,
      note,
    });

    return res.status(201).json({ internalNote });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const addOutgoingMessage = async (req: AuthRequest, res: Response) => {
  try {
    const conversationId = Number(req.params.id);
    const { content, messageType, mediaUrl } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content é obrigatório' });
    }

    const message = await WhatsAppMessage.create({
      conversationId,
      direction: 'outgoing',
      messageType: messageType ?? 'text',
      content,
      mediaUrl: mediaUrl ?? null,
      sentAt: new Date(),
    });

    await WhatsAppConversation.update(
      {
        lastMessage: content,
        lastMessageAt: new Date(),
      },
      { where: { id: conversationId } }
    );

    return res.status(201).json({ message });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const listTags = async (_req: AuthRequest, res: Response) => {
  try {
    const tags = await WhatsAppTag.findAll({ order: [['name', 'ASC']] });
    return res.json({ tags });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
