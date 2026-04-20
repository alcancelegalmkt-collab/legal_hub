import { Case } from '../models';
import { Client } from '../models';
import schedulingService from './schedulingService';
import { subDays, format } from 'date-fns';

interface DashboardMetrics {
  jobs: {
    active: number;
    jobNames: string[];
  };
  cases: {
    total: number;
    active: number;
    completed: number;
    new: number;
  };
  clients: {
    total: number;
    active: number;
  };
  emails: {
    sent: number;
    failed: number;
    pending: number;
  };
  webhooks: {
    triggered: number;
    processed: number;
  };
  system: {
    uptime: number;
    memoryUsage: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
    };
    timestamp: string;
  };
}

interface JobLog {
  jobName: string;
  status: 'success' | 'failed' | 'running';
  lastRun: Date;
  nextRun: Date;
  message: string;
}

interface ActivityLog {
  id: string;
  type: 'email' | 'case-update' | 'webhook' | 'job';
  action: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: Date;
  details?: string;
}

class MonitoringService {
  private activityLogs: ActivityLog[] = [];
  private startTime = new Date();

  /**
   * Registrar atividade no log
   */
  logActivity(
    type: ActivityLog['type'],
    action: string,
    status: 'success' | 'failed' | 'pending',
    details?: string
  ) {
    const log: ActivityLog = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      action,
      status,
      timestamp: new Date(),
      details,
    };

    this.activityLogs.push(log);

    // Manter apenas últimas 500 atividades (evitar memory leak)
    if (this.activityLogs.length > 500) {
      this.activityLogs = this.activityLogs.slice(-500);
    }

    console.log(`📊 [${type.toUpperCase()}] ${action} - ${status}`);
  }

  /**
   * Obter métricas do dashboard
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      // Casos
      const allCases = await Case.findAll();
      const activeCases = allCases.filter((c: any) => c.status === 'active');
      const completedCases = allCases.filter((c: any) => c.status === 'completed');
      const newCases = allCases.filter((c: any) => c.status === 'new');

      // Clientes
      const allClients = await Client.findAll();
      const activeClients = allClients.filter((c: any) => c.active === true);

      // Jobs
      const activeJobs = schedulingService.listActiveJobs();

      // Memory usage
      const memUsage = process.memoryUsage();

      return {
        jobs: {
          active: activeJobs.length,
          jobNames: activeJobs,
        },
        cases: {
          total: allCases.length,
          active: activeCases.length,
          completed: completedCases.length,
          new: newCases.length,
        },
        clients: {
          total: allClients.length,
          active: activeClients.length,
        },
        emails: {
          sent: this.countActivityByType('email', 'success'),
          failed: this.countActivityByType('email', 'failed'),
          pending: this.countActivityByType('email', 'pending'),
        },
        webhooks: {
          triggered: this.countActivityByType('webhook', 'success') +
            this.countActivityByType('webhook', 'failed'),
          processed: this.countActivityByType('webhook', 'success'),
        },
        system: {
          uptime: Date.now() - this.startTime.getTime(),
          memoryUsage: {
            rss: Math.round(memUsage.rss / 1024 / 1024), // MB
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          },
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('❌ Erro ao obter métricas:', error);
      throw error;
    }
  }

  /**
   * Obter activity logs (últimas N atividades)
   */
  getActivityLogs(limit: number = 50, type?: ActivityLog['type']): ActivityLog[] {
    let logs = [...this.activityLogs];

    if (type) {
      logs = logs.filter(log => log.type === type);
    }

    return logs.slice(-limit).reverse();
  }

  /**
   * Obter estatísticas de emails (últimos 7 dias)
   */
  getEmailStats(): {
    sent: number;
    failed: number;
    today: number;
    last7Days: number;
  } {
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const allEmailLogs = this.activityLogs.filter(log => log.type === 'email');

    return {
      sent: allEmailLogs.filter(log => log.status === 'success').length,
      failed: allEmailLogs.filter(log => log.status === 'failed').length,
      today: allEmailLogs.filter(
        log => new Date(log.timestamp) >= todayStart && log.status === 'success'
      ).length,
      last7Days: allEmailLogs.filter(
        log => new Date(log.timestamp) >= sevenDaysAgo && log.status === 'success'
      ).length,
    };
  }

  /**
   * Obter estatísticas por hora (para gráfico)
   */
  getHourlyStats(): Array<{
    hour: string;
    emails: number;
    webhooks: number;
    cases: number;
  }> {
    const now = new Date();
    const hours: { [key: string]: { emails: number; webhooks: number; cases: number } } = {};

    // Criar últimas 24 horas
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourKey = format(hour, 'HH:00');
      hours[hourKey] = { emails: 0, webhooks: 0, cases: 0 };
    }

    // Contar atividades
    for (const log of this.activityLogs) {
      const logHour = format(new Date(log.timestamp), 'HH:00');
      if (hours[logHour]) {
        if (log.type === 'email') hours[logHour].emails++;
        else if (log.type === 'webhook') hours[logHour].webhooks++;
        else if (log.type === 'case-update') hours[logHour].cases++;
      }
    }

    return Object.entries(hours).map(([hour, data]) => ({
      hour,
      ...data,
    }));
  }

  /**
   * Obter status de saúde do sistema
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    checks: {
      database: 'ok' | 'error';
      jobs: 'ok' | 'error';
      memoryUsage: 'ok' | 'warning' | 'critical';
      errorRate: 'ok' | 'warning' | 'critical';
    };
    message: string;
  } {
    const memUsage = process.memoryUsage();
    const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

    const errorLogs = this.activityLogs.filter(log => log.status === 'failed');
    const totalLogs = this.activityLogs.length;
    const errorRate = totalLogs > 0 ? (errorLogs.length / totalLogs) * 100 : 0;

    const checks = {
      database: 'ok' as const,
      jobs: schedulingService.listActiveJobs().length > 0 ? ('ok' as const) : ('error' as const),
      memoryUsage: heapUsagePercent > 80 ? ('critical' as const) : heapUsagePercent > 60 ? ('warning' as const) : ('ok' as const),
      errorRate: errorRate > 10 ? ('critical' as const) : errorRate > 5 ? ('warning' as const) : ('ok' as const),
    };

    const hasWarning = Object.values(checks).includes('warning');
    const hasError = Object.values(checks).includes('error') ||
      Object.values(checks).includes('critical');

    const status = hasError ? 'critical' : hasWarning ? 'warning' : 'healthy';

    return {
      status,
      checks,
      message:
        status === 'critical'
          ? '⚠️ Sistema com problemas'
          : status === 'warning'
            ? '⚡ Atenção recomendada'
            : '✅ Sistema saudável',
    };
  }

  /**
   * Limpar logs antigos
   */
  clearOldLogs(daysToKeep: number = 7) {
    const cutoffDate = subDays(new Date(), daysToKeep);
    const initialCount = this.activityLogs.length;

    this.activityLogs = this.activityLogs.filter(
      log => new Date(log.timestamp) > cutoffDate
    );

    console.log(
      `🧹 Limpeza de logs: ${initialCount} → ${this.activityLogs.length} (removeu ${initialCount - this.activityLogs.length})`
    );
  }

  /**
   * Helper: contar atividades
   */
  private countActivityByType(
    type: ActivityLog['type'],
    status?: 'success' | 'failed' | 'pending'
  ): number {
    return this.activityLogs.filter(
      log => log.type === type && (!status || log.status === status)
    ).length;
  }
}

export default new MonitoringService();
