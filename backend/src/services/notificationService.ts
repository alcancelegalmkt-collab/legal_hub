import webpush from 'web-push';

interface PushSubscription {
  userId: number;
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
}

interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  preferences: Record<string, boolean>;
}

// Initialize web-push with VAPID keys (from environment variables)
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidEmail = process.env.VAPID_EMAIL || 'support@legal-hub.local';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

// In-memory store for subscriptions (should be replaced with database)
const subscriptions = new Map<string, PushSubscription>();
const userSettings = new Map<number, UserSettings>();

class NotificationService {
  async saveSubscription(subscription: PushSubscription): Promise<void> {
    // In production, save to database
    subscriptions.set(subscription.endpoint, subscription);
    console.log(`Subscription saved for user ${subscription.userId}`);
  }

  async removeSubscription(endpoint: string): Promise<void> {
    subscriptions.delete(endpoint);
    console.log(`Subscription removed: ${endpoint}`);
  }

  async sendNotification(
    userId: number,
    payload: NotificationPayload
  ): Promise<{ sent: number; failed: number }> {
    const userSubs = Array.from(subscriptions.values()).filter(
      (sub) => sub.userId === userId
    );

    let sent = 0;
    let failed = 0;

    for (const subscription of userSubs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify(payload)
        );
        sent++;
      } catch (error: any) {
        console.error(`Failed to send notification to ${subscription.endpoint}:`, error);
        failed++;

        // Remove subscription if it's invalid
        if (error.statusCode === 410 || error.statusCode === 404) {
          this.removeSubscription(subscription.endpoint);
        }
      }
    }

    return { sent, failed };
  }

  async broadcastNotification(payload: NotificationPayload): Promise<{
    sent: number;
    failed: number;
  }> {
    let sent = 0;
    let failed = 0;

    for (const subscription of subscriptions.values()) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify(payload)
        );
        sent++;
      } catch (error: any) {
        console.error(
          `Failed to broadcast notification to ${subscription.endpoint}:`,
          error
        );
        failed++;

        // Remove subscription if it's invalid
        if (error.statusCode === 410 || error.statusCode === 404) {
          this.removeSubscription(subscription.endpoint);
        }
      }
    }

    return { sent, failed };
  }

  async getUserSettings(userId: number): Promise<UserSettings> {
    return (
      userSettings.get(userId) || {
        emailNotifications: true,
        pushNotifications: true,
        preferences: {
          documentSigned: true,
          documentGenerated: true,
          caseStatusChanged: true,
          dailyDigest: false,
        },
      }
    );
  }

  async updateUserSettings(
    userId: number,
    settings: Partial<UserSettings>
  ): Promise<UserSettings> {
    const currentSettings = await this.getUserSettings(userId);
    const updated = {
      ...currentSettings,
      ...settings,
      preferences: {
        ...currentSettings.preferences,
        ...settings.preferences,
      },
    };

    userSettings.set(userId, updated);
    return updated;
  }

  async notifyDocumentSigned(documentData: {
    id: number;
    type: string;
    clientName: string;
    ownerId: number;
  }): Promise<void> {
    const payload: NotificationPayload = {
      title: '✅ Documento Assinado',
      body: `${documentData.type} de ${documentData.clientName} foi assinado`,
      icon: '/favicon.ico',
      tag: `document-${documentData.id}`,
      data: {
        url: `/documents/${documentData.id}`,
        type: 'document_signed',
      },
    };

    const settings = await this.getUserSettings(documentData.ownerId);
    if (settings.pushNotifications && settings.preferences.documentSigned) {
      await this.sendNotification(documentData.ownerId, payload);
    }
  }

  async notifyDocumentGenerated(documentData: {
    id: number;
    type: string;
    clientName: string;
    ownerId: number;
  }): Promise<void> {
    const payload: NotificationPayload = {
      title: '📄 Documento Gerado',
      body: `Novo ${documentData.type} gerado para ${documentData.clientName}`,
      icon: '/favicon.ico',
      tag: `document-generated-${documentData.id}`,
      data: {
        url: `/documents/${documentData.id}`,
        type: 'document_generated',
      },
    };

    const settings = await this.getUserSettings(documentData.ownerId);
    if (settings.pushNotifications && settings.preferences.documentGenerated) {
      await this.sendNotification(documentData.ownerId, payload);
    }
  }

  async notifyCaseStatusChanged(caseData: {
    id: number;
    title: string;
    newStatus: string;
    ownerId: number;
  }): Promise<void> {
    const payload: NotificationPayload = {
      title: '⚖️ Caso Atualizado',
      body: `Status de "${caseData.title}" alterado para ${caseData.newStatus}`,
      icon: '/favicon.ico',
      tag: `case-${caseData.id}`,
      data: {
        url: `/cases/${caseData.id}`,
        type: 'case_status_changed',
      },
    };

    const settings = await this.getUserSettings(caseData.ownerId);
    if (settings.pushNotifications && settings.preferences.caseStatusChanged) {
      await this.sendNotification(caseData.ownerId, payload);
    }
  }

  getSubscriptionCount(): number {
    return subscriptions.size;
  }

  getUserSubscriptionCount(userId: number): number {
    return Array.from(subscriptions.values()).filter((sub) => sub.userId === userId)
      .length;
  }
}

export default new NotificationService();
