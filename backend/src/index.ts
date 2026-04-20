import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { sequelize } from './models';
import authRoutes from './routes/authRoutes';
import leadRoutes from './routes/leadRoutes';
import clientRoutes from './routes/clientRoutes';
import caseRoutes from './routes/caseRoutes';
import documentRoutes from './routes/documentRoutes';
import whatsappRoutes from './routes/whatsappRoutes';
import emailRoutes from './routes/emailRoutes';
import schedulingRoutes from './routes/schedulingRoutes';
import webhookRoutes from './routes/webhookRoutes';
import monitoringRoutes from './routes/monitoringRoutes';
import deadlineRoutes from './routes/deadlineRoutes';
import escavadorRoutes from './routes/escavadorRoutes';
import { initializeWhatsApp } from './services/whatsappService';
import schedulingService from './services/schedulingService';

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
app.use('/api/leads', leadRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/scheduling', schedulingRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/deadlines', deadlineRoutes);
app.use('/api/escavador', escavadorRoutes);

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
    setTimeout(() => {
      console.log('\n⏰ Iniciando agendador de emails...');
      schedulingService.startAllJobs();
    }, 3000);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();

export default app;
