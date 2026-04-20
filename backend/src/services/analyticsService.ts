import { Op, Sequelize } from 'sequelize';
import Document from '../models/Document';
import Case from '../models/Case';
import Client from '../models/Client';
import sequelize from '../database';

interface DocumentStats {
  total: number;
  signed: number;
  pending: number;
  byType: Record<string, number>;
  averageTimeToSign: number;
  signatureSuccessRate: number;
}

interface CaseStats {
  total: number;
  active: number;
  completed: number;
  averageCompletionTime: number;
  byArea: Record<string, number>;
}

interface TeamStats {
  totalDocumentsGenerated: number;
  averageDocumentsPerDay: number;
  peakDay: string;
  documentsThisMonth: number;
  documentsThisWeek: number;
}

interface ClientStats {
  total: number;
  active: number;
  averageDocumentsPerClient: number;
  averageCasesPerClient: number;
}

interface DashboardMetrics {
  documents: DocumentStats;
  cases: CaseStats;
  team: TeamStats;
  clients: ClientStats;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: Date;
  }>;
}

interface DocumentTrendData {
  date: string;
  generated: number;
  signed: number;
  pending: number;
}

interface DocumentTypeBreakdown {
  type: string;
  count: number;
  percentage: number;
  averageTimeToSign: number;
}

interface CompletionRateByArea {
  area: string;
  completed: number;
  total: number;
  completionRate: number;
}

class AnalyticsService {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const [documents, cases, clients, recentActivity] = await Promise.all([
      this.getDocumentStats(),
      this.getCaseStats(),
      this.getClientStats(),
      this.getRecentActivity(),
    ]);

    const team = await this.getTeamStats();

    return {
      documents,
      cases,
      team,
      clients,
      recentActivity,
    };
  }

  private async getDocumentStats(): Promise<DocumentStats> {
    const docs = await Document.findAll();
    const total = docs.length;
    const signed = docs.filter((d) => d.status === 'signed').length;
    const pending = docs.filter((d) => d.status === 'pending' || d.status === 'in_progress').length;

    const byType: Record<string, number> = {};
    docs.forEach((doc) => {
      byType[doc.type] = (byType[doc.type] || 0) + 1;
    });

    const averageTimeToSign = await this.calculateAverageSigningTime();
    const signatureSuccessRate = total > 0 ? (signed / total) * 100 : 0;

    return {
      total,
      signed,
      pending,
      byType,
      averageTimeToSign,
      signatureSuccessRate,
    };
  }

  private async getCaseStats(): Promise<CaseStats> {
    const cases = await Case.findAll();
    const total = cases.length;
    const active = cases.filter((c) => c.status === 'active' || c.status === 'in_progress').length;
    const completed = cases.filter((c) => c.status === 'completed' || c.status === 'closed').length;

    const byArea: Record<string, number> = {};
    cases.forEach((c) => {
      byArea[c.area] = (byArea[c.area] || 0) + 1;
    });

    const averageCompletionTime = await this.calculateAverageCaseCompletionTime();

    return {
      total,
      active,
      completed,
      averageCompletionTime,
      byArea,
    };
  }

  private async getClientStats(): Promise<ClientStats> {
    const clients = await Client.findAll();
    const total = clients.length;
    const active = clients.filter((c) => c.status === 'active').length;

    const docs = await Document.findAll();
    const cases = await Case.findAll();

    const averageDocumentsPerClient = docs.length / (total || 1);
    const averageCasesPerClient = cases.length / (total || 1);

    return {
      total,
      active,
      averageDocumentsPerClient,
      averageCasesPerClient,
    };
  }

  private async getTeamStats(): Promise<TeamStats> {
    const docs = await Document.findAll();
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const totalDocumentsGenerated = docs.length;
    const documentsThisMonth = docs.filter((d) => new Date(d.createdAt) >= startOfMonth).length;
    const documentsThisWeek = docs.filter((d) => new Date(d.createdAt) >= startOfWeek).length;

    const daysCount = Math.max(1, Math.floor((today.getTime() - (docs[0]?.createdAt || today).getTime()) / (1000 * 60 * 60 * 24)) || 1);
    const averageDocumentsPerDay = totalDocumentsGenerated / daysCount;

    const peakDay = await this.calculatePeakDay(docs);

    return {
      totalDocumentsGenerated,
      averageDocumentsPerDay,
      peakDay,
      documentsThisMonth,
      documentsThisWeek,
    };
  }

  private async calculateAverageSigningTime(): Promise<number> {
    const signedDocs = await Document.findAll({
      where: { status: 'signed' },
    });

    if (signedDocs.length === 0) return 0;

    const times = signedDocs.map((doc) => {
      if (!doc.sentAt || !doc.signedAt) return 0;
      return (new Date(doc.signedAt).getTime() - new Date(doc.sentAt).getTime()) / (1000 * 60 * 60 * 24);
    });

    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  private async calculateAverageCaseCompletionTime(): Promise<number> {
    const completedCases = await Case.findAll({
      where: { status: ['completed', 'closed'] },
    });

    if (completedCases.length === 0) return 0;

    const times = completedCases.map((c) => {
      if (!c.createdAt || !c.closedAt) return 0;
      return (new Date(c.closedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    });

    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  private async calculatePeakDay(docs: any[]): Promise<string> {
    const days: Record<string, number> = {};

    docs.forEach((doc) => {
      const day = new Date(doc.createdAt).toLocaleDateString('pt-BR', { weekday: 'long' });
      days[day] = (days[day] || 0) + 1;
    });

    let peakDay = 'Desconhecido';
    let maxCount = 0;

    Object.entries(days).forEach(([day, count]) => {
      if ((count as number) > maxCount) {
        maxCount = count as number;
        peakDay = day;
      }
    });

    return peakDay;
  }

  private async getRecentActivity(): Promise<Array<{ type: string; description: string; timestamp: Date }>> {
    const recentDocs = await Document.findAll({
      limit: 5,
      order: [['updatedAt', 'DESC']],
    });

    const recentCases = await Case.findAll({
      limit: 5,
      order: [['updatedAt', 'DESC']],
    });

    const activities: Array<{ type: string; description: string; timestamp: Date }> = [];

    recentDocs.forEach((doc) => {
      activities.push({
        type: 'document',
        description: `Documento ${doc.type} - ${doc.status}`,
        timestamp: doc.updatedAt,
      });
    });

    recentCases.forEach((c) => {
      activities.push({
        type: 'case',
        description: `Caso ${c.title} - ${c.status}`,
        timestamp: c.updatedAt,
      });
    });

    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
  }

  async getDocumentTrends(days: number = 30): Promise<DocumentTrendData[]> {
    const docs = await Document.findAll();
    const trends: Record<string, { generated: number; signed: number; pending: number }> = {};

    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      trends[dateStr] = { generated: 0, signed: 0, pending: 0 };

      docs.forEach((doc) => {
        const docDate = new Date(doc.createdAt).toISOString().split('T')[0];
        if (docDate === dateStr) {
          trends[dateStr].generated++;
          if (doc.status === 'signed') trends[dateStr].signed++;
          if (doc.status === 'pending' || doc.status === 'in_progress') trends[dateStr].pending++;
        }
      });
    }

    return Object.entries(trends).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  async getDocumentTypeBreakdown(): Promise<DocumentTypeBreakdown[]> {
    const docs = await Document.findAll();
    const total = docs.length;

    const byType: Record<string, { count: number; signingTimes: number[] }> = {};

    docs.forEach((doc) => {
      if (!byType[doc.type]) {
        byType[doc.type] = { count: 0, signingTimes: [] };
      }
      byType[doc.type].count++;

      if (doc.status === 'signed' && doc.sentAt && doc.signedAt) {
        const time = (new Date(doc.signedAt).getTime() - new Date(doc.sentAt).getTime()) / (1000 * 60 * 60 * 24);
        byType[doc.type].signingTimes.push(time);
      }
    });

    return Object.entries(byType).map(([type, data]) => {
      const avgSigningTime = data.signingTimes.length > 0
        ? data.signingTimes.reduce((a, b) => a + b, 0) / data.signingTimes.length
        : 0;

      return {
        type,
        count: data.count,
        percentage: (data.count / total) * 100,
        averageTimeToSign: avgSigningTime,
      };
    });
  }

  async getCaseCompletionByArea(): Promise<CompletionRateByArea[]> {
    const cases = await Case.findAll();

    const byArea: Record<string, { completed: number; total: number }> = {};

    cases.forEach((c) => {
      if (!byArea[c.area]) {
        byArea[c.area] = { completed: 0, total: 0 };
      }
      byArea[c.area].total++;
      if (c.status === 'completed' || c.status === 'closed') {
        byArea[c.area].completed++;
      }
    });

    return Object.entries(byArea).map(([area, data]) => ({
      area,
      ...data,
      completionRate: (data.completed / data.total) * 100,
    }));
  }

  async getMonthlyMetrics(month?: number, year?: number) {
    const today = new Date();
    const targetMonth = month || today.getMonth() + 1;
    const targetYear = year || today.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const docs = await Document.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const cases = await Case.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    const clients = await Client.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    return {
      month: targetMonth,
      year: targetYear,
      documentsGenerated: docs.length,
      documentsSigned: docs.filter((d) => d.status === 'signed').length,
      casesCreated: cases.length,
      casesCompleted: cases.filter((c) => c.status === 'completed' || c.status === 'closed').length,
      newClients: clients.length,
      averageDocumentsPerClient: docs.length / (clients.length || 1),
    };
  }

  async exportMetricsToCSV(): Promise<string> {
    const metrics = await this.getDashboardMetrics();
    const documentTrends = await this.getDocumentTrends(30);
    const documentTypes = await this.getDocumentTypeBreakdown();
    const caseCompletion = await this.getCaseCompletionByArea();

    let csv = 'Legal Hub Analytics Report\n';
    csv += `Generated: ${new Date().toLocaleString('pt-BR')}\n\n`;

    csv += '=== DOCUMENT METRICS ===\n';
    csv += `Total Documents,${metrics.documents.total}\n`;
    csv += `Signed Documents,${metrics.documents.signed}\n`;
    csv += `Pending Documents,${metrics.documents.pending}\n`;
    csv += `Signature Success Rate,%,${metrics.documents.signatureSuccessRate.toFixed(2)}\n`;
    csv += `Average Time to Sign,days,${metrics.documents.averageTimeToSign.toFixed(2)}\n\n`;

    csv += '=== CASE METRICS ===\n';
    csv += `Total Cases,${metrics.cases.total}\n`;
    csv += `Active Cases,${metrics.cases.active}\n`;
    csv += `Completed Cases,${metrics.cases.completed}\n`;
    csv += `Average Completion Time,days,${metrics.cases.averageCompletionTime.toFixed(2)}\n\n`;

    csv += '=== TEAM METRICS ===\n';
    csv += `Total Documents Generated,${metrics.team.totalDocumentsGenerated}\n`;
    csv += `Documents This Month,${metrics.team.documentsThisMonth}\n`;
    csv += `Documents This Week,${metrics.team.documentsThisWeek}\n`;
    csv += `Average Documents Per Day,${metrics.team.averageDocumentsPerDay.toFixed(2)}\n`;
    csv += `Peak Day,${metrics.team.peakDay}\n\n`;

    csv += '=== CLIENT METRICS ===\n';
    csv += `Total Clients,${metrics.clients.total}\n`;
    csv += `Active Clients,${metrics.clients.active}\n`;
    csv += `Average Documents Per Client,${metrics.clients.averageDocumentsPerClient.toFixed(2)}\n`;
    csv += `Average Cases Per Client,${metrics.clients.averageCasesPerClient.toFixed(2)}\n\n`;

    csv += '=== DOCUMENT TYPE BREAKDOWN ===\n';
    csv += 'Type,Count,Percentage,Avg Time to Sign (days)\n';
    documentTypes.forEach((dt) => {
      csv += `${dt.type},${dt.count},${dt.percentage.toFixed(2)},${dt.averageTimeToSign.toFixed(2)}\n`;
    });

    csv += '\n=== CASE COMPLETION BY AREA ===\n';
    csv += 'Area,Completed,Total,Completion Rate %\n';
    caseCompletion.forEach((cc) => {
      csv += `${cc.area},${cc.completed},${cc.total},${cc.completionRate.toFixed(2)}\n`;
    });

    return csv;
  }
}

export default new AnalyticsService();
