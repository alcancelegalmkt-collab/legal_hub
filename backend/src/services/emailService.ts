import { Resend } from 'resend';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

interface CaseUpdateData {
  clientName: string;
  clientEmail: string;
  caseName: string;
  caseNumber: string;
  description: string;
  status: 'new' | 'active' | 'completed';
  completionPercentage: number;
  nextDeadline?: {
    date: Date;
    description: string;
    type: 'hearing' | 'document' | 'response';
  };
  recentActivities: Array<{
    date: Date;
    action: string;
    details: string;
  }>;
  requiredDocuments?: string[];
  urgencyLevel: 'green' | 'orange' | 'red';
}

class EmailService {
  private fromEmail = process.env.EMAIL_FROM || 'noreply@legal-hub.com';
  private replyTo = process.env.EMAIL_REPLY_TO || 'suporte@legal-hub.com';

  async sendEmail(options: EmailOptions): Promise<any> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY not configured. Email will not be sent.');
        return { success: false, message: 'Email service not configured' };
      }

      const response = await resend.emails.send({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo || this.replyTo,
      });

      console.log('✅ Email sent:', response);
      return { success: true, messageId: (response as any).id || 'sent' };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }

  generateCaseUpdateEmail(data: CaseUpdateData): EmailOptions {
    const statusLabels = {
      new: '🆕 Novo',
      active: '⚙️ Em Andamento',
      completed: '✅ Concluído',
    };

    const urgencyLabels = {
      green: 'Normal',
      orange: 'Atenção',
      red: 'Urgente',
    };

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .case-info { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #667eea; }
    .status-badge { display: inline-block; padding: 8px 12px; border-radius: 4px; font-weight: 600; margin: 10px 0; }
    .status-badge.new { background: #dbeafe; color: #1e40af; }
    .status-badge.active { background: #fef08a; color: #854d0e; }
    .status-badge.completed { background: #dcfce7; color: #166534; }
    .progress-bar { background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; margin: 15px 0; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); text-align: center; color: white; font-size: 12px; line-height: 20px; }
    .deadline { padding: 15px; background: #fef2f2; border-left: 4px solid #ef4444; margin: 15px 0; border-radius: 4px; }
    .deadline.orange { background: #fffbeb; border-left-color: #f59e0b; }
    .deadline.green { background: #f0fdf4; border-left-color: #10b981; }
    .activity { padding: 12px; border-left: 3px solid #e5e7eb; margin: 10px 0; }
    .activity:first-child { margin-top: 15px; }
    .urgency-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 12px; color: white; }
    .urgency-badge.red { background: #ef4444; }
    .urgency-badge.orange { background: #f59e0b; }
    .urgency-badge.green { background: #10b981; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; margin-top: 20px; }
    .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Atualização do seu caso</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Legal Hub - Acompanhamento de Processo</p>
    </div>

    <div class="content">
      <p>Olá <strong>${data.clientName}</strong>,</p>

      <p>Há novidades sobre seu caso! Confira os detalhes abaixo:</p>

      <div class="case-info">
        <div style="margin-bottom: 15px;">
          <strong style="font-size: 16px;">${data.caseName}</strong>
          <br><span style="color: #6b7280;">Processo: ${data.caseNumber}</span>
        </div>

        <span class="status-badge ${data.status}">${statusLabels[data.status]}</span>
        <span class="urgency-badge ${data.urgencyLevel}">🚨 ${urgencyLabels[data.urgencyLevel]}</span>

        <p style="margin: 15px 0 5px 0; color: #6b7280; font-size: 14px;">Progresso do caso:</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${data.completionPercentage}%;">
            ${data.completionPercentage}%
          </div>
        </div>

        <p style="margin: 15px 0 10px 0;"><strong>Descrição:</strong></p>
        <p style="margin: 0; color: #4b5563;">${data.description}</p>
      </div>

      ${data.nextDeadline ? `
      <div class="deadline ${data.urgencyLevel}">
        <strong>⏰ Próximo prazo:</strong>
        <p style="margin: 8px 0; color: #1f2937;">
          ${format(new Date(data.nextDeadline.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          <br><span style="font-size: 14px; color: #6b7280;">${data.nextDeadline.type === 'hearing' ? '🏛️' : '📄'} ${data.nextDeadline.description}</span>
        </p>
      </div>
      ` : ''}

      <div>
        <strong style="display: block; margin-top: 20px; margin-bottom: 10px;">📝 Atividades recentes:</strong>
        ${data.recentActivities.slice(0, 3).map(activity => `
          <div class="activity">
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
              ${format(new Date(activity.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </div>
            <strong>${activity.action}</strong>
            <p style="margin: 4px 0 0 0; color: #4b5563; font-size: 14px;">${activity.details}</p>
          </div>
        `).join('')}
      </div>

      ${data.requiredDocuments && data.requiredDocuments.length > 0 ? `
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px; border-radius: 4px;">
        <strong>📎 Documentos pendentes:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          ${data.requiredDocuments.map(doc => `<li style="margin: 5px 0;">${doc}</li>`).join('')}
        </ul>
      </div>
      ` : ''}

      <a href="https://legal-hub.com" class="button">Acessar seu caso</a>

      <div class="footer">
        <p>Legal Hub - Sistema de Acompanhamento de Processos Jurídicos</p>
        <p>Dúvidas? Responda este email ou acesse nossa central de ajuda.</p>
        <p style="margin-top: 10px;">© 2026 Legal Hub. Todos os direitos reservados.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
ATUALIZAÇÃO DO SEU CASO

Olá ${data.clientName},

Há novidades sobre seu caso! Confira os detalhes:

CASO: ${data.caseName}
Processo: ${data.caseNumber}
Status: ${statusLabels[data.status]}
Progresso: ${data.completionPercentage}%
Urgência: ${urgencyLabels[data.urgencyLevel]}

DESCRIÇÃO:
${data.description}

${data.nextDeadline ? `PRÓXIMO PRAZO:
${format(new Date(data.nextDeadline.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
${data.nextDeadline.description}

` : ''}ATIVIDADES RECENTES:
${data.recentActivities.slice(0, 3).map(a =>
  `${format(new Date(a.date), "dd/MM/yyyy HH:mm", { locale: ptBR })} - ${a.action}\n${a.details}`
).join('\n\n')}

${data.requiredDocuments && data.requiredDocuments.length > 0 ? `DOCUMENTOS PENDENTES:
${data.requiredDocuments.map(d => `- ${d}`).join('\n')}

` : ''}Acesse sua conta para mais detalhes: https://legal-hub.com

---
Legal Hub - Sistema de Acompanhamento de Processos Jurídicos
Dúvidas? Responda este email.
    `;

    return {
      to: data.clientEmail,
      subject: `${data.caseName} - ${statusLabels[data.status]} (${data.completionPercentage}% concluído)`,
      html,
      text,
    };
  }

  async sendCaseUpdate(data: CaseUpdateData): Promise<any> {
    const emailOptions = this.generateCaseUpdateEmail(data);
    return this.sendEmail(emailOptions);
  }

  async sendSimpleEmail(to: string, subject: string, message: string): Promise<any> {
    return this.sendEmail({
      to,
      subject,
      html: `<p>${message}</p>`,
      text: message,
    });
  }
}

export default new EmailService();
