import express from 'express';
import * as notificationsController from '../controllers/notificationsController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Subscriptions
router.post('/subscribe', notificationsController.subscribeToPushNotifications);
router.post('/unsubscribe', notificationsController.unsubscribeFromPushNotifications);

// Send notifications
router.post('/send', notificationsController.sendNotification);
router.post('/document/signed', notificationsController.notifyDocumentSigned);
router.post('/document/generated', notificationsController.notifyDocumentGenerated);
router.post('/case/status-changed', notificationsController.notifyCaseStatusChanged);

// Settings
router.get('/settings', notificationsController.getNotificationSettings);
router.put('/settings', notificationsController.updateNotificationSettings);

export default router;
