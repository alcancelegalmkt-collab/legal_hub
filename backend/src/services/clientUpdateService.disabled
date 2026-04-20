import Case from '../models/Case';
import Document from '../models/Document';
import Client from '../models/Client';
import caseProgressService from './caseProgressService';

interface ClientSummary {
  clientId: number;
  clientName: string;
  clientEmail: string;
  activeCases: number;
  completedCases: number;
  recentUpdates: Array<{
    caseTitle: string;
    description: string;
    type: string;
    date: Date;
  }>;
  pendingDocuments: number;
  signedDocuments: number;
  upcomingDeadlines: Array<{
    caseTitle: string;
    deadline: Date;
    daysRemaining: number;
  }>;
}

interface EmailContent {
  subject: string;
  htmlContent: string;
  plainTextContent: string;
}

class ClientUpdateService {
  async generateClientSummary(clientId: number): Promise<ClientSummary> {
    const client = await Client.findByPk(clientId, {
      include: [
        { model: Case, as: 'cases', include: [{ model: Document, as: 'documents' }] },
      ],
    });

    if (!client) {
      throw new Error('Client not found');
    }

    const cases = client.cases || [];
    const activeCases = cases.filter(
      (c: any) => c.status === 'new' || c.status === 'in_progress' || c.status === 'active'
    ).length;
    const completedCases = cases.filter(
      (c: any) => c.status === 'completed' || c.status === 'closed'
    ).length;

    // Collect all documents
    let allDocuments: any[] = [];
    cases.forEach((c: any) => {
      if (c.documents) {
        allDocuments = allDocuments.concat(c.documents);
      }
    });

    const pendingDocuments = allDocuments.filter(
      (d: any) => d.status === 'pending' || d.status === 'in_progress'
    ).length;
    const signedDocuments = allDocuments.filter((d: any) => d.status === 'signed').length;

    // Get recent updates
    const recentUpdates = await this.getRecentUpdates(cases);

    // Get upcoming deadlines
    const upcomingDeadlines = this.getUpcomingDeadlines(cases);

    return {
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      activeCases,
      completedCases,
      recentUpdates,
      pendingDocuments,
      signedDocuments,
      upcomingDeadlines,
    };
  }

  private async getRecentUpdates(
    cases: any[]
  ): Promise<ClientSummary['recentUpdates']> {
    const updates: ClientSummary['recentUpdates'] = [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const caseRecord of cases) {
      // Case updates
      if (caseRecord.updatedAt && new Date(caseRecord.updatedAt) > sevenDaysAgo) {
        updates.push({
          caseTitle: caseRecord.title,
          description: `Caso atualizado para status: ${caseRecord.status}`,
          type: 'case_update',
          date: new Date(caseRecord.updatedAt),
        });
      }

      // Document updates
      if (caseRecord.documents) {
        caseRecord.documents.forEach((doc: any) => {
          if (doc.signedAt && new Date(doc.signedAt) > sevenDaysAgo) {
            updates.push({
              caseTitle: caseRecord.title,
              description: `Documento ${doc.type} foi assinado`,
              type: 'document_signed',
              date: new Date(doc.signedAt),
            });
          }
        });
      }
    }

    // Sort by date (newest first)
    updates.sort((a, b) => b.date.getTime() - a.date.getTime());

    return updates.slice(0, 10); // Last 10 updates
  }

  private getUpcomingDeadlines(cases: any[]): ClientSummary['upcomingDeadlines'] {
    const deadlines: ClientSummary['upcomingDeadlines'] = [];
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    cases.forEach((c: any) => {
      if (
        c.expectedClosureDate &&
        new Date(c.expectedClosureDate) > now &&
        new Date(c.expectedClosureDate) <= thirtyDaysFromNow
      ) {
        const deadline = new Date(c.expectedClosureDate);
        const daysRemaining = Math.ceil(
          (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        deadlines.push({
          caseTitle: c.title,
          deadline,
          daysRemaining,
        });
      }
    });

    // Sort by date (nearest first)
    deadlines.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

    return deadlines;
  }

  async generateUpdateEmail(clientId: number): Promise<EmailContent> {
    const summary = await this.generateClientSummary(clientId);

    const htmlContent = this.buildHtmlEmail(summary);
    const plainTextContent = this.buildPlainTextEmail(summary);

    return {
      subject: `Legal Hub - Atualização sobre seus casos - ${new Date().toLocaleDateString(
        'pt-BR'
      )}`,
      htmlContent,
      plainTextContent,
    };
  }

  private buildHtmlEmail(summary: ClientSummary): string {
    const now = new Date().toLocaleDateString('pt-BR');

    let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .section { margin-bottom: 20px; border: 1px solid #e0e0e0; padding: 15px;
               border-radius: 8px; }
    .section-title { font-size: 18px; font-weight: bold; color: #667eea;
                     margin-bottom: 10px; }
    .stat-box { display: inline-block; margin-right: 15px;
                padding: 10px 15px; background: #f0f0f0; border-radius: 5px; }
    .stat-number { font-size: 24px; font-weight: bold; color: #667eea; }
    .stat-label { font-size: 12px; color: #666; }
    .update-item { padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .update-item:last-child { border-bottom: none; }
    .update-date { color: #999; font-size: 12px; }
    .deadline-warning { background: #fff3cd; padding: 10px; border-radius: 5px;
                        margin: 5px 0; border-left: 4px solid #ffc107; }
    .footer { color: #999; font-size: 12px; text-align: center; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚖️ Legal Hub - Atualização sobre seus casos</h1>
      <p>Data: ${now}</p>
    </div>

    <div class="section">
      <div class="section-title">📊 Resumo Geral</div>
      <div class="stat-box">
        <div class="stat-number">${summary.activeCases}</div>
        <div class="stat-label">Casos Ativos</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${summary.completedCases}</div>
        <div class="stat-label">Casos Concluídos</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${summary.signedDocuments}</div>
        <div class="stat-label">Docs Assinados</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${summary.pendingDocuments}</div>
        <div class="stat-label">Docs Pendentes</div>
      </div>
    </div>
`;

    if (summary.recentUpdates.length > 0) {
      html += `
    <div class="section">
      <div class="section-title">📬 Atualizações Recentes</div>
`;
      summary.recentUpdates.forEach((update) => {
        html += `
      <div class="update-item">
        <strong>${update.caseTitle}</strong><br>
        ${update.description}<br>
        <span class="update-date">${new Date(update.date).toLocaleDateString('pt-BR')}</span>
      </div>
`;
      });
      html += `
    </div>
`;
    }

    if (summary.upcomingDeadlines.length > 0) {
      html += `
    <div class="section">
      <div class="section-title">📅 Prazos Próximos</div>
`;
      summary.upcomingDeadlines.forEach((deadline) => {
        const urgency =
          deadline.daysRemaining <= 7
            ? '🔴 Urgente'
            : deadline.daysRemaining <= 14
              ? '🟡 Atenção'
              : '🟢 Normal';
        html += `
      <div class="deadline-warning">
        <strong>${deadline.caseTitle}</strong><br>
        ${urgency} - Prazo em ${deadline.daysRemaining} dias<br>
        ${new Date(deadline.deadline).toLocaleDateString('pt-BR')}
      </div>
`;
      });
      html += `
    </div>
`;
    }

    html += `
    <div class="footer">
      <p>Esta é uma mensagem automática de atualização do sistema Legal Hub.</p>
      <p>Para mais detalhes, acesse sua conta em <a href="https://seu-dominio.com">seu-dominio.com</a></p>
    </div>
  </div>
</body>
</html>
`;

    return html;
  }

  private buildPlainTextEmail(summary: ClientSummary): string {
    const now = new Date().toLocaleDateString('pt-BR');

    let text = `
⚖️ LEGAL HUB - ATUALIZAÇÃO SOBRE SEUS CASOS
Data: ${now}

=== RESUMO GERAL ===
Casos Ativos: ${summary.activeCases}
Casos Concluídos: ${summary.completedCases}
Documentos Assinados: ${summary.signedDocuments}
Documentos Pendentes: ${summary.pendingDocuments}
`;

    if (summary.recentUpdates.length > 0) {
      text += `
=== ATUALIZAÇÕES RECENTES ===
`;
      summary.recentUpdates.forEach((update) => {
        text += `
${update.caseTitle}
${update.description}
Data: ${new Date(update.date).toLocaleDateString('pt-BR')}
`;
      });
    }

    if (summary.upcomingDeadlines.length > 0) {
      text += `
=== PRAZOS PRÓXIMOS ===
`;
      summary.upcomingDeadlines.forEach((deadline) => {
        const urgency =
          deadline.daysRemaining <= 7
            ? 'URGENTE'
            : deadline.daysRemaining <= 14
              ? 'ATENÇÃO'
              : 'NORMAL';
        text += `
${deadline.caseTitle}
Status: ${urgency} - Prazo em ${deadline.daysRemaining} dias
Data: ${new Date(deadline.deadline).toLocaleDateString('pt-BR')}
`;
      });
    }

    text += `
=====================================
Esta é uma mensagem automática do sistema Legal Hub.
Para mais detalhes, acesse https://seu-dominio.com
`;

    return text;
  }

  async sendUpdateToClient(
    clientId: number,
    emailService: any
  ): Promise<void> {
    const client = await Client.findByPk(clientId);

    if (!client || !client.email) {
      throw new Error('Client not found or no email');
    }

    const emailContent = await this.generateUpdateEmail(clientId);

    await emailService.sendEmail({
      to: client.email,
      subject: emailContent.subject,
      html: emailContent.htmlContent,
      text: emailContent.plainTextContent,
    });
  }

  async scheduleWeeklyUpdates(emailService: any): Promise<number> {
    const clients = await Client.findAll({
      where: { status: 'active' },
    });

    let sent = 0;

    for (const client of clients) {
      try {
        await this.sendUpdateToClient(client.id, emailService);
        sent++;
      } catch (error) {
        console.error(`Failed to send update to client ${client.id}:`, error);
      }
    }

    return sent;
  }
}

export default new ClientUpdateService();
