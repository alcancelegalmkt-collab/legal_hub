import Case from '../models/Case';
import Document from '../models/Document';

export interface CaseProgress {
  caseId: number;
  caseName: string;
  status: string;
  area: string;
  completionPercentage: number;
  nextDeadline?: {
    date: Date;
    description: string;
  };
  recentActivities: Array<{
    type: string;
    description: string;
    date: Date;
  }>;
  documentsStatus: {
    total: number;
    signed: number;
    pending: number;
  };
  timelineEvents: Array<{
    date: Date;
    type: string;
    description: string;
    status: 'completed' | 'pending' | 'upcoming';
  }>;
}

export interface CaseUpdate {
  caseId: number;
  type:
    | 'status_change'
    | 'document_signed'
    | 'deadline_added'
    | 'document_generated'
    | 'note_added';
  description: string;
  importance: 'high' | 'medium' | 'low';
  timestamp: Date;
}

class CaseProgressService {
  async getCaseProgress(caseId: number): Promise<CaseProgress> {
    const caseRecord = await Case.findByPk(caseId, {
      include: [{ model: Document, as: 'documents' }],
    });

    if (!caseRecord) {
      throw new Error('Case not found');
    }

    const documents = caseRecord.documents || [];
    const totalDocs = documents.length;
    const signedDocs = documents.filter((d: any) => d.status === 'signed').length;
    const pendingDocs = documents.filter(
      (d: any) => d.status === 'pending' || d.status === 'in_progress'
    ).length;

    // Calculate completion percentage
    let completionPercentage = 0;
    if (caseRecord.status === 'completed') {
      completionPercentage = 100;
    } else if (caseRecord.status === 'closed') {
      completionPercentage = 100;
    } else if (caseRecord.status === 'in_progress') {
      // 40% for active, plus document progress
      completionPercentage = 40 + (totalDocs > 0 ? (signedDocs / totalDocs) * 40 : 0);
    } else {
      // 20% for new
      completionPercentage = 20 + (totalDocs > 0 ? (signedDocs / totalDocs) * 30 : 0);
    }

    // Get timeline events
    const timelineEvents = this.buildTimeline(caseRecord, documents);

    return {
      caseId: caseRecord.id,
      caseName: caseRecord.title,
      status: caseRecord.status,
      area: caseRecord.area,
      completionPercentage: Math.round(completionPercentage),
      nextDeadline: this.getNextDeadline(caseRecord),
      recentActivities: this.getRecentActivities(caseRecord, documents),
      documentsStatus: {
        total: totalDocs,
        signed: signedDocs,
        pending: pendingDocs,
      },
      timelineEvents,
    };
  }

  async getCaseProgressByClient(clientId: number): Promise<CaseProgress[]> {
    const cases = await Case.findAll({
      where: { clientId },
      include: [{ model: Document, as: 'documents' }],
    });

    const progressList: CaseProgress[] = [];

    for (const caseRecord of cases) {
      const progress = await this.getCaseProgress(caseRecord.id);
      progressList.push(progress);
    }

    return progressList;
  }

  private buildTimeline(caseRecord: any, documents: any[]): CaseProgress['timelineEvents'] {
    const events: CaseProgress['timelineEvents'] = [];

    // Case created
    events.push({
      date: new Date(caseRecord.createdAt),
      type: 'case_created',
      description: `Caso "${caseRecord.title}" criado`,
      status: 'completed',
    });

    // Documents generated/signed
    documents.forEach((doc: any) => {
      if (doc.createdAt) {
        events.push({
          date: new Date(doc.createdAt),
          type: 'document_generated',
          description: `${doc.type} gerado`,
          status: 'completed',
        });
      }

      if (doc.signedAt) {
        events.push({
          date: new Date(doc.signedAt),
          type: 'document_signed',
          description: `${doc.type} assinado`,
          status: 'completed',
        });
      }
    });

    // Upcoming milestones
    if (caseRecord.expectedClosureDate) {
      events.push({
        date: new Date(caseRecord.expectedClosureDate),
        type: 'expected_closure',
        description: 'Data esperada de conclusão',
        status: new Date(caseRecord.expectedClosureDate) > new Date() ? 'upcoming' : 'pending',
      });
    }

    // Sort by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    return events;
  }

  private getNextDeadline(caseRecord: any): CaseProgress['nextDeadline'] {
    if (caseRecord.expectedClosureDate && new Date(caseRecord.expectedClosureDate) > new Date()) {
      return {
        date: new Date(caseRecord.expectedClosureDate),
        description: 'Data esperada de conclusão',
      };
    }

    return undefined;
  }

  private getRecentActivities(
    caseRecord: any,
    documents: any[]
  ): CaseProgress['recentActivities'] {
    const activities: CaseProgress['recentActivities'] = [];

    // Case status change
    if (caseRecord.updatedAt) {
      activities.push({
        type: 'status',
        description: `Status alterado para: ${caseRecord.status}`,
        date: new Date(caseRecord.updatedAt),
      });
    }

    // Recent documents
    const recentDocs = documents
      .filter((d: any) => d.signedAt)
      .sort((a: any, b: any) => new Date(b.signedAt).getTime() - new Date(a.signedAt).getTime())
      .slice(0, 3);

    recentDocs.forEach((doc: any) => {
      activities.push({
        type: 'document',
        description: `${doc.type} assinado`,
        date: new Date(doc.signedAt),
      });
    });

    // Sort by date (newest first)
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());

    return activities.slice(0, 5); // Last 5 activities
  }

  async trackUpdate(update: CaseUpdate): Promise<void> {
    // In production, save to database for history
    console.log('Case update tracked:', update);
  }

  async getCaseUpdates(
    caseId: number,
    since?: Date
  ): Promise<CaseUpdate[]> {
    // Query database for updates since date
    const caseRecord = await Case.findByPk(caseId);

    if (!caseRecord) {
      return [];
    }

    const updates: CaseUpdate[] = [];

    // Build updates from case and related documents
    if (!since || new Date(caseRecord.updatedAt) > since) {
      updates.push({
        caseId,
        type: 'status_change',
        description: `Caso atualizado para: ${caseRecord.status}`,
        importance: 'medium',
        timestamp: new Date(caseRecord.updatedAt),
      });
    }

    return updates;
  }

  async getOpenCasesWithDeadlines(lawyerId: number): Promise<any[]> {
    const cases = await Case.findAll({
      where: {
        lawyerId,
        status: ['new', 'in_progress', 'active'],
      },
      order: [['expectedClosureDate', 'ASC']],
    });

    return cases.map((c: any) => ({
      id: c.id,
      title: c.title,
      area: c.area,
      status: c.status,
      daysUntilDeadline: c.expectedClosureDate
        ? Math.ceil(
            (new Date(c.expectedClosureDate).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : null,
      deadline: c.expectedClosureDate,
    }));
  }

  async getOverdueDeadlines(lawyerId: number): Promise<any[]> {
    const cases = await Case.findAll({
      where: {
        lawyerId,
        status: ['new', 'in_progress', 'active'],
      },
    });

    const now = new Date();

    return cases
      .filter((c: any) => c.expectedClosureDate && new Date(c.expectedClosureDate) < now)
      .map((c: any) => ({
        id: c.id,
        title: c.title,
        area: c.area,
        daysOverdue: Math.ceil(
          (now.getTime() - new Date(c.expectedClosureDate).getTime()) / (1000 * 60 * 60 * 24)
        ),
        deadline: c.expectedClosureDate,
      }));
  }
}

export default new CaseProgressService();
