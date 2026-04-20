import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import trelloService from '../services/trelloService';
import Document from '../models/Document';

export const createDocumentCard = async (_req: AuthRequest, res: Response) => {
  try {
    const { documentId, boardName, listName } = req.body;

    if (!documentId) {
      return res.status(400).json({
        error: 'documentId é obrigatório',
      });
    }

    // Verificar se documento existe
    const document = await Document.findByPk(documentId);
    if (!document) {
      return res.status(404).json({
        error: 'Documento não encontrado',
      });
    }

    // Criar card no Trello
    const card = await trelloService.createDocumentCard({
      documentId,
      boardName: boardName || 'Documentos Assinados',
      listName: listName || 'Concluído',
    });

    return res.status(201).json({
      message: 'Card criado no Trello com sucesso',
      card,
      trelloUrl: `https://trello.com/c/${card.id}`,
    });
  } catch (error: any) {
    console.error('Erro ao criar card:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getBoards = async (_req: AuthRequest, res: Response) => {
  try {
    const boards = await trelloService.getBoards();

    return res.json({
      boards,
      count: boards.length,
    });
  } catch (error: any) {
    console.error('Erro ao buscar boards:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getListsInBoard = async (_req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;

    if (!boardId) {
      return res.status(400).json({
        error: 'boardId é obrigatório',
      });
    }

    const lists = await trelloService.getListsInBoard(boardId);

    return res.json({
      boardId,
      lists,
      count: lists.length,
    });
  } catch (error: any) {
    console.error('Erro ao buscar lists:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const updateCard = async (_req: AuthRequest, res: Response) => {
  try {
    const { cardId } = req.params;
    const updates = req.body;

    if (!cardId) {
      return res.status(400).json({
        error: 'cardId é obrigatório',
      });
    }

    const card = await trelloService.updateCard(cardId, updates);

    return res.json({
      message: 'Card atualizado com sucesso',
      card,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar card:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const addCommentToCard = async (_req: AuthRequest, res: Response) => {
  try {
    const { cardId } = req.params;
    const { comment } = req.body;

    if (!cardId || !comment) {
      return res.status(400).json({
        error: 'cardId e comment são obrigatórios',
      });
    }

    await trelloService.addCommentToCard(cardId, comment);

    return res.json({
      message: 'Comentário adicionado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao adicionar comentário:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const addMemberToCard = async (_req: AuthRequest, res: Response) => {
  try {
    const { cardId } = req.params;
    const { memberId } = req.body;

    if (!cardId || !memberId) {
      return res.status(400).json({
        error: 'cardId e memberId são obrigatórios',
      });
    }

    await trelloService.addMemberToCard(cardId, memberId);

    return res.json({
      message: 'Membro adicionado ao card com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao adicionar membro:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const createCaseCard = async (_req: AuthRequest, res: Response) => {
  try {
    const { caseId, listId } = req.body;

    if (!caseId || !listId) {
      return res.status(400).json({
        error: 'caseId e listId são obrigatórios',
      });
    }

    const card = await trelloService.createCaseCard(caseId, listId);

    return res.status(201).json({
      message: 'Card do caso criado com sucesso',
      card,
      trelloUrl: `https://trello.com/c/${card.id}`,
    });
  } catch (error: any) {
    console.error('Erro ao criar card do caso:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const addChecklistToCard = async (_req: AuthRequest, res: Response) => {
  try {
    const { cardId } = req.params;
    const { checklistName, items } = req.body;

    if (!cardId || !checklistName || !items || items.length === 0) {
      return res.status(400).json({
        error: 'cardId, checklistName e items são obrigatórios',
      });
    }

    const checklist = await trelloService.createChecklistOnCard(
      cardId,
      checklistName,
      items
    );

    return res.status(201).json({
      message: 'Checklist criada com sucesso',
      checklist,
    });
  } catch (error: any) {
    console.error('Erro ao criar checklist:', error);
    return res.status(400).json({
      error: error.message,
    });
  }
};
