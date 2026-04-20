import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';
import Document from '../models/Document';

interface ZapsignDocument {
  uuid: string;
  name: string;
  signers: Array<{
    email: string;
    name: string;
  }>;
  file_url: string;
  status: 'pending' | 'completed' | 'expired' | 'declined';
  created_at: string;
}

interface SendDocumentRequest {
  documentId: number;
  signerEmail: string;
  signerName: string;
}

class ZapsignService {
  private api: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ZAPSIGN_API_KEY || '';

    this.api = axios.create({
      baseURL: 'https://api.zapsign.com.br/api/v1',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    // Error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('ZapSign API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  /**
   * Envia um documento para o ZapSign para assinatura
   */
  async sendDocumentForSignature(request: SendDocumentRequest): Promise<{
    zapsignId: string;
    signLink: string;
    document: any;
  }> {
    try {
      // Buscar documento no banco
      const doc = await Document.findByPk(request.documentId);
      if (!doc) {
        throw new Error(`Documento não encontrado: ${request.documentId}`);
      }

      // Verificar se arquivo existe
      if (!fs.existsSync(doc.filePath)) {
        throw new Error(`Arquivo não encontrado: ${doc.filePath}`);
      }

      // Preparar formulário com arquivo
      const formData = new FormData();
      formData.append('name', doc.title);
      formData.append('file', fs.createReadStream(doc.filePath));
      formData.append('signers', JSON.stringify([
        {
          email: request.signerEmail,
          name: request.signerName,
        },
      ]));

      // Enviar para ZapSign
      const response = await this.api.post('/docs/', formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

      const zapsignDoc = response.data;

      // Atualizar documento no banco
      await doc.update({
        status: 'pending_signature',
        zapsignId: zapsignDoc.uuid,
        zapsignSignLink: zapsignDoc.sign_link,
      });

      return {
        zapsignId: zapsignDoc.uuid,
        signLink: zapsignDoc.sign_link,
        document: doc,
      };
    } catch (error: any) {
      console.error('Erro ao enviar documento para ZapSign:', error);
      throw new Error(`Falha ao enviar para ZapSign: ${error.message}`);
    }
  }

  /**
   * Obtém status do documento no ZapSign
   */
  async getDocumentStatus(zapsignId: string): Promise<ZapsignDocument> {
    try {
      const response = await this.api.get(`/docs/${zapsignId}/`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao obter status do ZapSign:', error);
      throw new Error(`Falha ao obter status: ${error.message}`);
    }
  }

  /**
   * Baixa documento assinado do ZapSign
   */
  async downloadSignedDocument(zapsignId: string, savePath: string): Promise<string> {
    try {
      const response = await this.api.get(`/docs/${zapsignId}/download/`, {
        responseType: 'arraybuffer',
      });

      fs.writeFileSync(savePath, response.data);
      return savePath;
    } catch (error: any) {
      console.error('Erro ao baixar documento assinado:', error);
      throw new Error(`Falha ao baixar documento: ${error.message}`);
    }
  }

  /**
   * Verifica e atualiza status de todos os documentos pendentes
   */
  async checkAndUpdateSignatureStatus(): Promise<number> {
    try {
      // Buscar todos os documentos pendentes de assinatura
      const pendingDocs = await Document.findAll({
        where: {
          status: 'pending_signature',
          zapsignId: { [require('sequelize').Op.not]: null },
        },
      });

      let updatedCount = 0;

      for (const doc of pendingDocs) {
        if (!doc.zapsignId) continue;

        try {
          const status = await this.getDocumentStatus(doc.zapsignId);

          if (status.status === 'completed') {
            // Download documento assinado
            const downloadsDir = require('path').join(process.cwd(), 'uploads', 'documents', 'signed');
            require('fs').mkdirSync(downloadsDir, { recursive: true });

            const signedPath = require('path').join(
              downloadsDir,
              `${doc.id}_signed_${Date.now()}.pdf`
            );

            await this.downloadSignedDocument(doc.zapsignId, signedPath);

            // Atualizar documento
            await doc.update({
              status: 'signed',
              signedAt: new Date(),
              filePath: signedPath,
              fileUrl: `/api/documents/download/${require('path').basename(signedPath)}`,
            });

            updatedCount++;
          } else if (status.status === 'declined') {
            await doc.update({
              status: 'rejected',
            });
            updatedCount++;
          }
        } catch (error) {
          console.error(`Erro ao verificar documento ${doc.id}:`, error);
        }
      }

      return updatedCount;
    } catch (error: any) {
      console.error('Erro ao verificar status de assinaturas:', error);
      throw error;
    }
  }

  /**
   * Processa webhook do ZapSign (chamado quando documento é assinado)
   */
  async processWebhook(payload: any): Promise<Document | null> {
    try {
      const { uuid, status } = payload;

      // Buscar documento pelo zapsignId
      const doc = await Document.findOne({
        where: { zapsignId: uuid },
      });

      if (!doc) {
        console.warn(`Documento não encontrado para ZapSign ID: ${uuid}`);
        return null;
      }

      if (status === 'completed') {
        // Download documento assinado
        const downloadsDir = require('path').join(process.cwd(), 'uploads', 'documents', 'signed');
        require('fs').mkdirSync(downloadsDir, { recursive: true });

        const signedPath = require('path').join(
          downloadsDir,
          `${doc.id}_signed_${Date.now()}.pdf`
        );

        await this.downloadSignedDocument(uuid, signedPath);

        // Atualizar documento
        await doc.update({
          status: 'signed',
          signedAt: new Date(),
          filePath: signedPath,
          fileUrl: `/api/documents/download/${require('path').basename(signedPath)}`,
        });

        console.log(`Documento ${doc.id} assinado com sucesso`);
        return doc;
      } else if (status === 'declined') {
        await doc.update({
          status: 'rejected',
        });
        console.log(`Documento ${doc.id} foi rejeitado`);
        return doc;
      }

      return doc;
    } catch (error: any) {
      console.error('Erro ao processar webhook do ZapSign:', error);
      throw error;
    }
  }

  /**
   * Gera link de assinatura rápida (sem salvar no ZapSign)
   */
  generateQuickSignLink(documentId: number, email: string): string {
    return `https://zapsign.com.br/api/doc/${documentId}/${email}`;
  }
}

export default new ZapsignService();
