import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { sequelize } from './models';
import authRoutes from './routes/authRoutes';
// import leadRoutes from './routes/leadRoutes'; // TEMPORARILY DISABLED TO TEST
import leadCompleteRoutes from './routes/leadCompleteRoutes';
// import clientRoutes from './routes/clientRoutes';
// import caseRoutes from './routes/caseRoutes';
// import documentRoutes from './routes/documentRoutes';
// import proposalRoutes from './routes/proposalRoutes';
// import proposalGeneratorRoutes from './routes/proposalGeneratorRoutes';
// import leadConversionRoutes from './routes/leadConversionRoutes';
import whatsappRoutes from './routes/whatsappRoutes';
import emailRoutes from './routes/emailRoutes';
// import caseProgressRoutes from './routes/caseProgressRoutes'; // TODO: Fix case progress service
// import analyticsRoutes from './routes/analyticsRoutes'; // TODO: Fix analytics service
// import trelloRoutes from './routes/trelloRoutes'; // TODO: Fix trello service
// import notificationsRoutes from './routes/notificationsRoutes'; // TODO: Fix notification service
// import schedulingRoutes from './routes/schedulingRoutes'; // TODO: Fix scheduling service
import webhookRoutes from './routes/webhookRoutes';
// import monitoringRoutes from './routes/monitoringRoutes'; // TODO: Fix monitoring service
// import deadlineRoutes from './routes/deadlineRoutes'; // TODO: Fix deadline service
// import escavadorRoutes from './routes/escavadorRoutes'; // TODO: Fix escavador service
import { initializeWhatsApp } from './services/whatsappService';
// import schedulingService from './services/schedulingService'; // TODO: Fix scheduling service

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
// Specific routes first (to avoid catch-all routes intercepting them)
app.use('/api/leads', leadCompleteRoutes);
// app.use('/api/leads', leadConversionRoutes); // TODO: Fix broken dependencies
// General routes last
// app.use('/api/leads', leadRoutes); // TEMPORARILY DISABLED TO TEST
// app.use('/api/clients', clientRoutes); // TODO: Fix broken dependencies
// app.use('/api/cases', caseRoutes); // TODO: Fix broken dependencies
// app.use('/api/documents', documentRoutes); // TODO: Fix broken dependencies
// app.use('/api/proposals', proposalRoutes); // TODO: Fix broken dependencies
// app.use('/api/proposals', proposalGeneratorRoutes); // TODO: Fix broken dependencies
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/emails', emailRoutes);
// app.use('/api/case-progress', caseProgressRoutes); // TODO: Fix case progress service
// app.use('/api/analytics', analyticsRoutes); // TODO: Fix analytics service
// app.use('/api/trello', trelloRoutes); // TODO: Fix trello service
// app.use('/api/notifications', notificationsRoutes); // TODO: Fix notification service
// app.use('/api/scheduling', schedulingRoutes); // TODO: Fix scheduling service
app.use('/api/webhooks', webhookRoutes);
// app.use('/api/monitoring', monitoringRoutes); // TODO: Fix monitoring service
// app.use('/api/deadlines', deadlineRoutes); // TODO: Fix deadline service
// app.use('/api/escavador', escavadorRoutes); // TODO: Fix escavador service

// Stub endpoints for disabled services
app.get('/api/analytics/dashboard', (_req, res) => {
  res.json({
    metrics: {
      totalLeads: 0,
      totalClients: 0,
      totalCases: 0,
      totalDocuments: 0
    }
  });
});
app.get('/api/analytics/trends/documents', (_req, res) => {
  res.json({ data: [] });
});
app.get('/api/monitoring/health', (_req, res) => {
  res.json({ health: { status: 'ok' } });
});
app.get('/api/monitoring/hourly', (_req, res) => {
  res.json({ data: [] });
});
app.get('/api/leads', (_req, res) => {
  res.json({ leads: [], total: 0 });
});
app.get('/api/cases', (_req, res) => {
  res.json({ cases: [], total: 0 });
});

// Database sync and start server
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Sync models (set force: false in production)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database tables synced');

    // Start HTTPS or HTTP server
    const isProduction = process.env.NODE_ENV === 'production';
    const useHttps = isProduction || process.env.HTTPS_ENABLED === 'true';

    if (useHttps) {
      const certPath = path.join(__dirname, '../certs/cert.pem');
      const keyPath = path.join(__dirname, '../certs/key.pem');

      if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        const credentials = {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        };
        https.createServer(credentials, app).listen(PORT, () => {
          console.log(`🔒 HTTPS Server running on https://localhost:${PORT}`);
          console.log(`📚 API Health Check: https://localhost:${PORT}/api/health`);
        });
      } else {
        console.warn('⚠️ SSL certificates not found, falling back to HTTP');
        app.listen(PORT, () => {
          console.log(`🚀 Server running on http://localhost:${PORT}`);
          console.log(`📚 API Health Check: http://localhost:${PORT}/api/health`);
        });
      }
    } else {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📚 API Health Check: http://localhost:${PORT}/api/health`);
      });
    }

    // Inicializar WhatsApp (não bloqueia o servidor)
    setTimeout(() => {
      console.log('\n📱 Iniciando WhatsApp...');
      initializeWhatsApp().catch((err) => {
        console.error('⚠️ Erro ao inicializar WhatsApp:', err);
      });
    }, 2000);

    // Inicializar agendamentos de email
    // TODO: Fix scheduling service and re-enable
    // setTimeout(() => {
    //   console.log('\n⏰ Iniciando agendador de emails...');
    //   schedulingService.startAllJobs();
    // }, 3000);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();

export default app;
