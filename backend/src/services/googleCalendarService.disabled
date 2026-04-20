import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

interface CalendarEvent {
  summary: string;
  description: string;
  start: { dateTime: string };
  end: { dateTime: string };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: string; minutes: number }>;
  };
  colorId?: string;
}

interface CaseDeadline {
  caseId: number;
  caseName: string;
  deadline: Date;
  type: 'hearing' | 'document_delivery' | 'response_deadline' | 'other';
  description: string;
}

class GoogleCalendarService {
  private oauth2Client: OAuth2Client | null = null;
  private calendar: any = null;

  constructor() {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URL || 'http://localhost:3000/api/calendar/callback'
      );

      this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    }
  }

  async getAuthUrl(): Promise<string> {
    if (!this.oauth2Client) {
      throw new Error('Google Calendar not configured');
    }

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  async setCredentials(code: string): Promise<any> {
    if (!this.oauth2Client) {
      throw new Error('Google Calendar not configured');
    }

    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    // Store tokens (in production, save to database)
    return tokens;
  }

  async setAccessToken(accessToken: string, refreshToken?: string): Promise<void> {
    if (!this.oauth2Client) {
      throw new Error('Google Calendar not configured');
    }

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  async createEvent(
    calendarId: string,
    event: CalendarEvent
  ): Promise<any> {
    if (!this.calendar) {
      throw new Error('Google Calendar not configured');
    }

    try {
      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: event,
      });

      return response.data;
    } catch (error: any) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  async updateEvent(
    calendarId: string,
    eventId: string,
    event: Partial<CalendarEvent>
  ): Promise<any> {
    if (!this.calendar) {
      throw new Error('Google Calendar not configured');
    }

    try {
      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        requestBody: event,
      });

      return response.data;
    } catch (error: any) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    if (!this.calendar) {
      throw new Error('Google Calendar not configured');
    }

    try {
      await this.calendar.events.delete({
        calendarId,
        eventId,
      });
    } catch (error: any) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  async getCalendarList(): Promise<any> {
    if (!this.calendar) {
      throw new Error('Google Calendar not configured');
    }

    try {
      const response = await this.calendar.calendarList.list();
      return response.data.items;
    } catch (error: any) {
      console.error('Error listing calendars:', error);
      throw error;
    }
  }

  async createCaseDeadlineEvent(
    calendarId: string,
    deadline: CaseDeadline
  ): Promise<any> {
    const colorMap: Record<string, string> = {
      hearing: '1', // Lavender
      document_delivery: '2', // Sage
      response_deadline: '3', // Flamingo
      other: '8', // Graphite
    };

    const event: CalendarEvent = {
      summary: `⚖️ ${deadline.caseName} - ${deadline.type.replace(/_/g, ' ')}`,
      description: deadline.description,
      start: {
        dateTime: deadline.deadline.toISOString(),
      },
      end: {
        dateTime: new Date(deadline.deadline.getTime() + 60 * 60 * 1000).toISOString(),
      },
      reminders: {
        useDefault: true,
        overrides: [
          { method: 'notification', minutes: 24 * 60 }, // 1 day before
          { method: 'notification', minutes: 60 }, // 1 hour before
        ],
      },
      colorId: colorMap[deadline.type],
    };

    return this.createEvent(calendarId, event);
  }

  async syncCaseDeadlines(
    calendarId: string,
    caseDeadlines: CaseDeadline[]
  ): Promise<{ created: number; updated: number; failed: number }> {
    let created = 0;
    let updated = 0;
    let failed = 0;

    for (const deadline of caseDeadlines) {
      try {
        await this.createCaseDeadlineEvent(calendarId, deadline);
        created++;
      } catch (error) {
        console.error(`Failed to sync deadline for case ${deadline.caseId}:`, error);
        failed++;
      }
    }

    return { created, updated, failed };
  }

  async getUpcomingDeadlines(calendarId: string, days: number = 30): Promise<any[]> {
    if (!this.calendar) {
      throw new Error('Google Calendar not configured');
    }

    try {
      const now = new Date();
      const future = new Date();
      future.setDate(future.getDate() + days);

      const response = await this.calendar.events.list({
        calendarId,
        timeMin: now.toISOString(),
        timeMax: future.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error: any) {
      console.error('Error getting upcoming deadlines:', error);
      return [];
    }
  }
}

export default new GoogleCalendarService();
