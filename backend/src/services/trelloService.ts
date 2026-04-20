import axios, { AxiosInstance } from 'axios';
import Client from '../models/Client';
import Case from '../models/Case';
import Document from '../models/Document';

interface TrelloBoard {
  id: string;
  name: string;
}

interface TrelloList {
  id: string;
  name: string;
  boardId: string;
}

interface TrelloCard {
  id: string;
  name: string;
  url: string;
  idList: string;
  desc: string;
  idLabels: string[];
}

interface CreateCardRequest {
  documentId: number;
  boardName?: string;
  listName?: string;
}

class TrelloService {
  private api: AxiosInstance;
  private apiKey: string;
  private token: string;

  constructor() {
    this.apiKey = process.env.TRELLO_API_KEY || '';
    this.token = process.env.TRELLO_TOKEN || '';

    this.api = axios.create({
      baseURL: 'https://api.trello.com/1',
      params: {
        key: this.apiKey,
        token: this.token,
      },
    });

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Trello API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  /**
   * Get user's boards
   */
  async getBoards(): Promise<TrelloBoard[]> {
    try {
      const response = await this.api.get('/members/me/boards');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar boards:', error);
      throw new Error(`Falha ao buscar boards: ${error.message}`);
    }
  }

  /**
   * Get lists in a board
   */
  async getListsInBoard(boardId: string): Promise<TrelloList[]> {
    try {
      const response = await this.api.get(`/boards/${boardId}/lists`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar lists:', error);
      throw new Error(`Falha ao buscar lists: ${error.message}`);
    }
  }

  /**
   * Create a card on a board
   */
  async createCard(
    listId: string,
    cardData: {
      name: string;
      desc: string;
      labels?: string[];
      dueDate?: string;
      idMembers?: string[];
    }
  ): Promise<TrelloCard> {
    try {
      const payload: any = {
        idList: listId,
        name: cardData.name,
        desc: cardData.desc,
      };

      if (cardData.labels && cardData.labels.length > 0) {
        payload.idLabels = cardData.labels;
      }

      if (cardData.dueDate) {
        payload.due = cardData.dueDate;
      }

      if (cardData.idMembers && cardData.idMembers.length > 0) {
        payload.idMembers = cardData.idMembers;
      }

      const response = await this.api.post('/cards', payload);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao criar card:', error);
      throw new Error(`Falha ao criar card: ${error.message}`);
    }
  }

  /**
   * Create a card for a signed document
   */
  async createDocumentCard(request: CreateCardRequest): Promise<TrelloCard> {
    try {
      // Buscar documento
      const document = await Document.findByPk(request.documentId, {
        include: [
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'name', 'cpfCnpj', 'email'],
          },
          {
            model: Case,
            as: 'case',
            attributes: ['id', 'title', 'legalArea', 'caseNumber'],
          },
        ],
      });

      if (!document) {
        throw new Error(`Documento não encontrado: ${request.documentId}`);
      }

      // Buscar board
      const boardName = request.boardName || 'Documentos Assinados';
      const boards = await this.getBoards();
      const board = boards.find((b) => b.name === boardName);

      if (!board) {
        throw new Error(`Board não encontrado: ${boardName}`);
      }

      // Buscar list
      const listName = request.listName || 'Concluído';
      const lists = await this.getListsInBoard(board.id);
      const list = lists.find((l) => l.name === listName);

      if (!list) {
        throw new Error(`List não encontrada: ${listName}`);
      }

      // Preparar descrição do card
      const client = (document as any).client || { name: 'Unknown', cpfCnpj: '', email: '' };
      const caseData = (document as any).case;

      let description = `**Cliente:** ${client.name}\n`;
      description += `**CPF/CNPJ:** ${client.cpfCnpj}\n`;
      description += `**Email:** ${client.email}\n`;
      description += `**Tipo:** ${document.type}\n`;
      description += `**Status:** Assinado\n`;

      if (caseData) {
        description += `\n**Caso:**\n`;
        description += `- Título: ${caseData.title}\n`;
        description += `- Área: ${caseData.legalArea}\n`;
        if (caseData.caseNumber) {
          description += `- Número: ${caseData.caseNumber}\n`;
        }
      }

      description += `\n**Link:** ${process.env.APP_URL}/documents/${document.id}`;

      // Criar card
      const card = await this.createCard(list.id, {
        name: `📄 ${document.title} - ${client.name}`,
        desc: description,
        labels: this.getLabelsForDocument(document.type),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });

      return card;
    } catch (error: any) {
      console.error('Erro ao criar card de documento:', error);
      throw error;
    }
  }

  /**
   * Update a card
   */
  async updateCard(
    cardId: string,
    updates: {
      name?: string;
      desc?: string;
      idList?: string;
      labels?: string[];
      due?: string;
      closed?: boolean;
    }
  ): Promise<TrelloCard> {
    try {
      const response = await this.api.put(`/cards/${cardId}`, updates);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao atualizar card:', error);
      throw new Error(`Falha ao atualizar card: ${error.message}`);
    }
  }

  /**
   * Add label to card
   */
  async addLabelToCard(cardId: string, labelId: string): Promise<void> {
    try {
      await this.api.post(`/cards/${cardId}/idLabels`, { value: labelId });
    } catch (error: any) {
      console.error('Erro ao adicionar label:', error);
      throw new Error(`Falha ao adicionar label: ${error.message}`);
    }
  }

  /**
   * Add member to card
   */
  async addMemberToCard(cardId: string, memberId: string): Promise<void> {
    try {
      await this.api.post(`/cards/${cardId}/idMembers`, { value: memberId });
    } catch (error: any) {
      console.error('Erro ao adicionar membro:', error);
      throw new Error(`Falha ao adicionar membro: ${error.message}`);
    }
  }

  /**
   * Add comment to card
   */
  async addCommentToCard(cardId: string, comment: string): Promise<void> {
    try {
      await this.api.post(`/cards/${cardId}/actions/comments`, { text: comment });
    } catch (error: any) {
      console.error('Erro ao adicionar comentário:', error);
      throw new Error(`Falha ao adicionar comentário: ${error.message}`);
    }
  }

  /**
   * Create checklist on card
   */
  async createChecklistOnCard(
    cardId: string,
    checklistName: string,
    items: string[]
  ): Promise<any> {
    try {
      const response = await this.api.post(`/cards/${cardId}/checklists`, {
        name: checklistName,
      });

      const checklist = response.data;

      // Adicionar itens à checklist
      for (const item of items) {
        await this.api.post(`/checklists/${checklist.id}/checkItems`, {
          name: item,
        });
      }

      return checklist;
    } catch (error: any) {
      console.error('Erro ao criar checklist:', error);
      throw new Error(`Falha ao criar checklist: ${error.message}`);
    }
  }

  /**
   * Get label color for document type
   */
  private getLabelsForDocument(documentType: string): string[] {
    const labelMap: { [key: string]: string[] } = {
      proposal: ['green'], // Proposta
      contract: ['blue'], // Contrato
      power_of_attorney: ['purple'], // Procuração
      financial_aid_declaration: ['yellow'], // Declaração
      other: ['grey'],
    };

    return labelMap[documentType] || ['grey'];
  }

  /**
   * Create a template card structure for a case
   */
  async createCaseCard(caseId: number, listId: string): Promise<TrelloCard> {
    try {
      const caseData = await Case.findByPk(caseId, {
        include: [
          {
            model: Client,
            as: 'client',
            attributes: ['id', 'name'],
          },
        ],
      });

      if (!caseData) {
        throw new Error(`Caso não encontrado: ${caseId}`);
      }

      const client = (caseData as any).client || { name: 'Unknown' };

      const card = await this.createCard(listId, {
        name: `⚖️ ${caseData.title} - ${client.name}`,
        desc: `**Cliente:** ${client.name}\n**Área:** ${caseData.legalArea}\n**Status:** Em Andamento`,
      });

      // Criar checklist com documentos necessários
      await this.createChecklistOnCard(card.id, 'Documentos', [
        'Contrato assinado',
        'Procuração',
        'Declaração de hipossuficiência (se aplicável)',
        'Documentos do cliente',
      ]);

      return card;
    } catch (error: any) {
      console.error('Erro ao criar card de caso:', error);
      throw error;
    }
  }
}

export default new TrelloService();
