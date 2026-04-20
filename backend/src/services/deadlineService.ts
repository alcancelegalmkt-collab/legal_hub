import { Case } from '../models';
import { Client } from '../models';
import emailService from './emailService';
import { differenceInDays, addDays, format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DeadlineAlert {
  caseId: number;
  caseName: string;
  caseNumber: string;
  deadline: Date;
  daysRemaining: number;
  urgencyLevel: 'green' | 'orange' | 'red' | 'critical';
  clientName: string;
  clientEmail: string;
  description?: string;
  requiresAction: boolean;
  actionRequired?: string;
}

interface CaseMovement {
  caseId: number;
  caseName: string;
  movementType: 'deadline' | 'status-change' | 'document-signed' | 'hearing' | 'update';
  description: string;
  timestamp: Date;
  importance: 'low' | 'medium' | 'high' | 'critical';
}

class DeadlineService {
  /**
   * Buscar prazos próximos (próximos 30 dias)
   */
  async getUpcomingDeadlines(daysAhead: number = 30): Promise<DeadlineAlert[]> {
    try {
      const now = new Date();
      const deadlineDate = addDays(now, daysAhead);

      const cases = await Case.findAll({
        where: {
          status: ['new', 'active'],
          deadline: {
            [require('sequelize').Op.between]: [now, deadlineDate],
          },
        },
        include: [{ model: Client, as: 'client' }],
        order: [['deadline', 'ASC']],
      });

      return cases.map((caseItem: any) => this.formatDeadlineAlert(caseItem));
    } catch (error) {
      console.error('❌ Erro ao buscar prazos próximos:', error);
      throw error;
    }
  }

  /**
   * Buscar prazos críticos (próximas 48 horas)
   */
  async getCriticalDeadlines(): Promise<DeadlineAlert[]> {
    try {
      const now = new Date();
      const twoDaysLater = addDays(now, 2);

      const cases = await Case.findAll({
        where: {
          status: ['new', 'active'],
          deadline: {
            [require('sequelize').Op.between]: [now, twoDaysLater],
          },
        },
        include: [{ model: Client, as: 'client' }],
        order: [['deadline', 'ASC']],
      });

      return cases.map((caseItem: any) => this.formatDeadlineAlert(caseItem));
    } catch (error) {
      console.error('❌ Erro ao buscar prazos críticos:', error);
      throw error;
    }
  }

  /**
   * Buscar prazos que passaram (vencidos)
   */
  async getOverdueDeadlines(): Promise<DeadlineAlert[]> {
    try {
      const now = new Date();

      const cases = await Case.findAll({
        where: {
          status: ['new', 'active'],
          deadline: {
            [require('sequelize').Op.lt]: now,
          },
        },
        include: [{ model: Client, as: 'client' }],
        order: [['deadline', 'DESC']],
      });

      return cases.map((caseItem: any) => {
        const alert = this.formatDeadlineAlert(caseItem);
        alert.urgencyLevel = 'critical';
        alert.requiresAction = true;
        alert.actionRequired = 'Prazo vencido - Ação imediata necessária!';
        return alert;
      });
    } catch (error) {
      console.error('❌ Erro ao buscar prazos vencidos:', error);
      throw error;
    }
  }

  /**
   * Formatar alerta de prazo
   */
  private formatDeadlineAlert(caseItem: any): DeadlineAlert {
    const now = new Date();
    const daysRemaining = differenceInDays(new Date(caseItem.deadline), now);

    let urgencyLevel: 'green' | 'orange' | 'red' | 'critical' = 'green';
    let requiresAction = false;

    if (daysRemaining < 0) {
      urgencyLevel = 'critical';
      requiresAction = true;
    } else if (daysRemaining <= 1) {
      urgencyLevel = 'critical';
      requiresAction = true;
    } else if (daysRemaining <= 3) {
      urgencyLevel = 'red';
      requiresAction = true;
    } else if (daysRemaining <= 7) {
      urgencyLevel = 'orange';
      requiresAction = true;
    }

    return {
      caseId: caseItem.id,
      caseName: caseItem.title,
      caseNumber: caseItem.processNumber,
      deadline: new Date(caseItem.deadline),
      daysRemaining,
      urgencyLevel,
      clientName: caseItem.client?.name || 'Cliente',
      clientEmail: caseItem.client?.email || '',
      description: caseItem.description,
      requiresAction,
      actionRequired:
        daysRemaining < 0
          ? `Vencido há ${Math.abs(daysRemaining)} dias`
          : daysRemaining === 0
            ? 'Vence HOJE'
            : daysRemaining === 1
              ? 'Vence amanhã'
              : `Vence em ${daysRemaining} dias`,
    };
  }

  /**
   * Enviar alertas de prazo para clientes
   */
  async sendDeadlineAlerts(): Promise<{
    sent: number;
    failed: number;
    results: Array<{ caseId: number; success: boolean; error?: string }>;
  }> {
    try {
      const criticalDeadlines = await this.getCriticalDeadlines();
      const results: Array<{ caseId: number; success: boolean; error?: string }> = [];
      let sent = 0;
      let failed = 0;

      for (const deadline of criticalDeadlines) {
        try {
          // Enviar email para cliente
          await emailService.sendSimpleEmail(
            deadline.clientEmail,
            `⚠️ ALERTA: Prazo próximo - ${deadline.caseName}`,
            `
Olá ${deadline.clientName},

ATENÇÃO: O prazo do seu caso está chegando!

📋 Caso: ${deadline.caseName}
📅 Prazo: ${format(deadline.deadline, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
⏰ Dias restantes: ${deadline.daysRemaining}

${deadline.actionRequired ? `⚠️ ${deadline.actionRequired}` : ''}

Descrição do caso:
${deadline.description || 'Sem descrição'}

Ação recomendada:
${this.getRecommendedAction(deadline.daysRemaining)}

Acesse sua conta para mais detalhes: https://legal-hub.com

---
Legal Hub - Sistema de Acompanhamento de Processos Jurídicos
            `
          );

          sent++;
          results.push({ caseId: deadline.caseId, success: true });
          console.log(`✅ Alerta enviado para ${deadline.clientName}`);
        } catch (error) {
          failed++;
          results.push({
            caseId: deadline.caseId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          console.error(
            `❌ Erro ao enviar alerta para caso ${deadline.caseId}:`,
            error
          );
        }
      }

      return { sent, failed, results };
    } catch (error) {
      console.error('❌ Erro em sendDeadlineAlerts:', error);
      throw error;
    }
  }

  /**
   * Registrar movimentação de caso
   */
  logMovement(movement: CaseMovement): void {
    console.log(
      `📌 [MOVIMENTO] ${movement.caseName}: ${movement.description} (${movement.importance})`
    );

    // TODO: Salvar em banco de dados para histórico
    // TODO: Disparar webhook para n8n
  }

  /**
   * Ação recomendada baseado em dias restantes
   */
  private getRecommendedAction(daysRemaining: number): string {
    if (daysRemaining < 0) {
      return '🚨 URGENTE: Prazo vencido! Contate seu advogado imediatamente.';
    }
    if (daysRemaining === 0) {
      return '🚨 CRÍTICO: Prazo vence HOJE! Ação imediata necessária.';
    }
    if (daysRemaining === 1) {
      return '⚠️ CRÍTICO: Prazo vence amanhã! Prepare documentação agora.';
    }
    if (daysRemaining <= 3) {
      return '⚠️ VERMELHO: Prepare toda documentação necessária.';
    }
    if (daysRemaining <= 7) {
      return '🟡 LARANJA: Comece a preparar documentação. Valide com seu advogado.';
    }
    return '🟢 Monitorar. Validar documentação com advogado.';
  }

  /**
   * Obter timeline de prazos para gráfico
   */
  async getDeadlineTimeline(months: number = 3): Promise<
    Array<{
      date: string;
      count: number;
      cases: Array<{ id: number; name: string }>;
    }>
  > {
    try {
      const now = new Date();
      const futureDate = addDays(now, months * 30);

      const cases = await Case.findAll({
        where: {
          deadline: {
            [require('sequelize').Op.between]: [now, futureDate],
          },
        },
      });

      // Agrupar por data
      const timeline: {
        [key: string]: Array<{ id: number; name: string }>;
      } = {};

      for (const caseItem of cases) {
        const dateKey = format(new Date(caseItem.deadline), 'yyyy-MM-dd');
        if (!timeline[dateKey]) {
          timeline[dateKey] = [];
        }
        timeline[dateKey].push({
          id: (caseItem as any).id,
          name: (caseItem as any).title,
        });
      }

      return Object.entries(timeline).map(([date, cases]) => ({
        date,
        count: cases.length,
        cases,
      }));
    } catch (error) {
      console.error('❌ Erro ao obter timeline:', error);
      throw error;
    }
  }

  /**
   * Estatísticas de prazos
   */
  async getDeadlineStats(): Promise<{
    total: number;
    overdue: number;
    critical: number;
    warning: number;
    normal: number;
    completionRate: number;
  }> {
    try {
      const now = new Date();
      const allCases = await Case.findAll({
        where: { status: ['new', 'active'] },
      });

      const overdue = allCases.filter(
        (c: any) => new Date(c.deadline) < now
      ).length;

      const critical = allCases.filter((c: any) => {
        const days = differenceInDays(new Date(c.deadline), now);
        return days >= 0 && days <= 3;
      }).length;

      const warning = allCases.filter((c: any) => {
        const days = differenceInDays(new Date(c.deadline), now);
        return days > 3 && days <= 14;
      }).length;

      const normal = allCases.filter((c: any) => {
        const days = differenceInDays(new Date(c.deadline), now);
        return days > 14;
      }).length;

      const completedCases = await Case.findAll({
        where: { status: 'completed' },
      });

      const completionRate = allCases.length > 0
        ? Math.round((completedCases.length / (allCases.length + completedCases.length)) * 100)
        : 0;

      return {
        total: allCases.length,
        overdue,
        critical,
        warning,
        normal,
        completionRate,
      };
    } catch (error) {
      console.error('❌ Erro ao obter stats:', error);
      throw error;
    }
  }
}

export default new DeadlineService();
