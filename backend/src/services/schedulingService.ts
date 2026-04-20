import cron from 'node-cron';
import { Case } from '../models';
import { Client } from '../models';
import emailService from './emailService';
import deadlineService from './deadlineService';
import escavadorService from './escavadorService';
import { addDays, isAfter, isBefore, differenceInDays } from 'date-fns';

class SchedulingService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Inicia todos os jobs agendados
   */
  startAllJobs() {
    console.log('⏰ Iniciando agendamentos...');

    this.scheduleWeeklyClientUpdates();
    this.scheduleDeadlineAlerts();
    this.scheduleCompletedCaseSummary();
    this.scheduleRealtimeDeadlineMonitoring();
    this.scheduleEscavadorSync();

    console.log('✅ Todos os agendamentos ativados');
  }

  /**
   * JOB 1: Enviar atualização semanal para clientes (toda segunda-feira às 9:00)
   */
  private scheduleWeeklyClientUpdates() {
    const job = cron.schedule('0 9 * * 1', async () => {
      console.log('📧 [JOB] Iniciando envio de atualizações semanais...');

      try {
        // Buscar todos os clientes ativos
        const clients = await Client.findAll({
          where: { active: true },
        });

        for (const client of clients) {
          try {
            // Buscar casos do cliente
            const cases = await Case.findAll({
              where: { clientId: client.id },
              order: [['updatedAt', 'DESC']],
            });

            if (cases.length === 0) continue;

            // Enviar email para cada caso ativo
            for (const caseItem of cases) {
              if (caseItem.status === 'completed') continue;

              // Buscar atividades recentes
              const recentActivities = [
                {
                  date: caseItem.updatedAt,
                  action: 'Caso atualizado',
                  details: `Status: ${caseItem.status}`,
                },
              ];

              // Calcular urgência baseado em deadline
              let urgencyLevel: 'green' | 'orange' | 'red' = 'green';
              if (caseItem.deadline) {
                const daysUntilDeadline = differenceInDays(
                  new Date(caseItem.deadline),
                  new Date()
                );
                if (daysUntilDeadline <= 7) {
                  urgencyLevel = 'red';
                } else if (daysUntilDeadline <= 14) {
                  urgencyLevel = 'orange';
                }
              }

              // Enviar email
              await emailService.sendCaseUpdate({
                clientName: client.name,
                clientEmail: client.email,
                caseName: caseItem.title,
                caseNumber: caseItem.processNumber,
                description: caseItem.description || 'Acompanhamento de caso',
                status: caseItem.status as 'new' | 'active' | 'completed',
                completionPercentage: caseItem.completionPercentage || 50,
                nextDeadline: caseItem.deadline
                  ? {
                      date: new Date(caseItem.deadline),
                      description: 'Prazo do caso',
                      type: 'document' as const,
                    }
                  : undefined,
                recentActivities,
                urgencyLevel,
              });

              console.log(
                `✅ Email enviado para ${client.email} - ${caseItem.title}`
              );
            }
          } catch (error) {
            console.error(
              `❌ Erro ao processar cliente ${client.email}:`,
              error
            );
          }
        }

        console.log('✅ [JOB] Atualizações semanais completas');
      } catch (error) {
        console.error('❌ [JOB] Erro em Weekly Updates:', error);
      }
    });

    this.jobs.set('weeklyClientUpdates', job);
    console.log('📅 JOB: Atualizações semanais (segunda-feira 9:00)');
  }

  /**
   * JOB 2: Alertas de prazos próximos (diariamente às 8:00)
   */
  private scheduleDeadlineAlerts() {
    const job = cron.schedule('0 8 * * *', async () => {
      console.log('⏰ [JOB] Verificando prazos próximos...');

      try {
        // Buscar casos com deadline nos próximos 7 dias
        const now = new Date();
        const sevenDaysLater = addDays(now, 7);

        const casesWithDeadline = await Case.findAll({
          where: {
            status: ['new', 'active'],
            deadline: {
              [require('sequelize').Op.between]: [now, sevenDaysLater],
            },
          },
          include: [{ model: Client, as: 'client' }],
        });

        for (const caseItem of casesWithDeadline) {
          const client = (caseItem as any).client;
          if (!client) continue;

          const daysUntilDeadline = differenceInDays(
            new Date(caseItem.deadline),
            now
          );

          let urgencyLevel: 'green' | 'orange' | 'red' = 'green';
          if (daysUntilDeadline <= 3) {
            urgencyLevel = 'red';
          } else if (daysUntilDeadline <= 5) {
            urgencyLevel = 'orange';
          }

          // Enviar alerta
          await emailService.sendCaseUpdate({
            clientName: client.name,
            clientEmail: client.email,
            caseName: caseItem.title,
            caseNumber: caseItem.processNumber,
            description: `⚠️ Prazo próximo! Faltam ${daysUntilDeadline} dias.`,
            status: caseItem.status as 'new' | 'active' | 'completed',
            completionPercentage: caseItem.completionPercentage || 50,
            nextDeadline: {
              date: new Date(caseItem.deadline),
              description: 'PRAZO IMPORTANTE',
              type: 'document' as const,
            },
            recentActivities: [],
            urgencyLevel,
          });

          console.log(
            `⚠️ Alerta enviado para ${client.email} - ${daysUntilDeadline} dias`
          );
        }

        console.log(
          `✅ [JOB] Verificação de prazos completa (${casesWithDeadline.length} alertas)`
        );
      } catch (error) {
        console.error('❌ [JOB] Erro em Deadline Alerts:', error);
      }
    });

    this.jobs.set('deadlineAlerts', job);
    console.log('📅 JOB: Alertas de prazos (diariamente 8:00)');
  }

  /**
   * JOB 3: Resumo de casos concluídos (toda sexta-feira às 17:00)
   */
  private scheduleCompletedCaseSummary() {
    const job = cron.schedule('0 17 * * 5', async () => {
      console.log('📊 [JOB] Gerando resumo de casos concluídos...');

      try {
        // Buscar casos concluídos na última semana
        const oneWeekAgo = addDays(new Date(), -7);

        const completedCases = await Case.findAll({
          where: {
            status: 'completed',
            updatedAt: {
              [require('sequelize').Op.gte]: oneWeekAgo,
            },
          },
          include: [{ model: Client, as: 'client' }],
        });

        // Agrupar por cliente
        const casesByClient: {
          [clientId: number]: { client: any; cases: any[] };
        } = {};

        for (const caseItem of completedCases) {
          const client = (caseItem as any).client;
          if (!client) continue;

          if (!casesByClient[client.id]) {
            casesByClient[client.id] = { client, cases: [] };
          }
          casesByClient[client.id].cases.push(caseItem);
        }

        // Enviar resumo para cada cliente
        for (const clientId in casesByClient) {
          const { client, cases } = casesByClient[clientId];

          const summary = cases
            .map((c: any) => `✅ ${c.title} (${c.processNumber})`)
            .join('\n');

          await emailService.sendSimpleEmail(
            client.email,
            `Resumo semanal: ${cases.length} caso(s) concluído(s)`,
            `
Olá ${client.name},

Parabéns! Seus seguintes casos foram concluídos esta semana:

${summary}

Você pode acessar os detalhes completos em sua conta.

Obrigado por confiar em nossos serviços!

Legal Hub
            `
          );

          console.log(
            `✅ Resumo enviado para ${client.email} (${cases.length} casos)`
          );
        }

        console.log(
          `✅ [JOB] Resumos de casos concluídos completo (${completedCases.length} casos)`
        );
      } catch (error) {
        console.error('❌ [JOB] Erro em Completed Case Summary:', error);
      }
    });

    this.jobs.set('completedCaseSummary', job);
    console.log('📅 JOB: Resumo de casos (sexta-feira 17:00)');
  }

  /**
   * JOB 4: Monitoramento em tempo real de prazos críticos (a cada 6 horas)
   */
  private scheduleRealtimeDeadlineMonitoring() {
    const job = cron.schedule('0 */6 * * *', async () => {
      console.log('📅 [JOB] Monitoramento de prazos em tempo real...');

      try {
        // Buscar prazos críticos
        const criticalDeadlines = await deadlineService.getCriticalDeadlines();
        const overdueDeadlines = await deadlineService.getOverdueDeadlines();

        if (criticalDeadlines.length > 0) {
          console.log(
            `🔴 ${criticalDeadlines.length} prazo(s) crítico(s) encontrado(s)`
          );
          // Enviar alertas
          await deadlineService.sendDeadlineAlerts();
        }

        if (overdueDeadlines.length > 0) {
          console.log(
            `🚨 ${overdueDeadlines.length} prazo(s) vencido(s) encontrado(s)!`
          );
          // Registrar em monitoramento
          for (const deadline of overdueDeadlines) {
            console.log(
              `⚠️ VENCIDO: ${deadline.caseName} (${deadline.daysRemaining} dias)`
            );
          }
        }

        console.log('✅ [JOB] Monitoramento de prazos completo');
      } catch (error) {
        console.error('❌ [JOB] Erro em Deadline Monitoring:', error);
      }
    });

    this.jobs.set('realtimeDeadlineMonitoring', job);
    console.log('📅 JOB: Monitoramento de prazos (a cada 6 horas)');
  }

  /**
   * JOB 5: Sincronização com Escavador (diariamente às 22:00)
   */
  private scheduleEscavadorSync() {
    const token = process.env.ESCAVADOR_API_KEY;

    if (!token) {
      console.warn(
        '⚠️ ESCAVADOR_API_KEY não configurada, Escavador sync desativado'
      );
      return;
    }

    const job = cron.schedule('0 22 * * *', async () => {
      console.log('🔄 [JOB] Iniciando sincronização com Escavador...');

      try {
        const resultado = await escavadorService.sincronizarProcessos();

        console.log(
          `✅ [JOB] Escavador sync concluído: ${resultado.sincronizados} sincronizados, ${resultado.comAtualizacoes} com atualizações, ${resultado.erros} erros`
        );

        if (resultado.detalhes.length > 0) {
          console.log(
            `📬 ${resultado.detalhes.length} movimentação(ões) detectada(s)`
          );
        }
      } catch (error) {
        console.error('❌ [JOB] Erro em Escavador Sync:', error);
      }
    });

    this.jobs.set('escavadorSync', job);
    console.log('📅 JOB: Sincronização Escavador (diariamente 22:00)');
  }

  /**
   * Parar um job específico
   */
  stopJob(jobName: string) {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      this.jobs.delete(jobName);
      console.log(`⏹️ Job "${jobName}" parado`);
    }
  }

  /**
   * Parar todos os jobs
   */
  stopAllJobs() {
    for (const [jobName, job] of this.jobs.entries()) {
      job.stop();
      console.log(`⏹️ Job "${jobName}" parado`);
    }
    this.jobs.clear();
    console.log('✅ Todos os jobs parados');
  }

  /**
   * Listar todos os jobs ativos
   */
  listActiveJobs() {
    return Array.from(this.jobs.keys());
  }
}

export default new SchedulingService();
