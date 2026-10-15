import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { prisma } from './database/prisma.js';

// Import route modules
import { authRoutes } from './modules/auth/auth.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { leadsRoutes } from './modules/leads/leads.routes.js';
import { campaignsRoutes } from './modules/campaigns/campaigns.routes.js';
import { metaAdsRoutes } from './modules/meta-ads/meta-ads.routes.js';
import { instagramRoutes } from './modules/instagram/instagram.routes.js';
import { attributionRoutes } from './modules/attribution/attribution.routes.js';
import { webhooksRoutes } from './modules/webhooks/webhooks.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { aiRoutes } from './modules/ai/ai.routes.js';
import { automationsRoutes } from './modules/automations/automations.routes.js';
import { reportsRoutes } from './modules/reports/reports.routes.js';
import { integrationsRoutes } from './modules/integrations/integrations.routes.js';
import { auditRoutes } from './modules/audit/audit.routes.js';

export function createApp(): Express {
  const app = express();

  // Basic security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Let reverse proxy handle CSP if needed
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS setup
  const configuredOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
  const allowedOrigins = [
    ...configuredOrigins,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'https://marketing.roboledpartner.com.br',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps, curl, server-to-server webhooks)
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive in dev/proxied tunnels
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-hub-signature-256', 'x-n8n-signature'],
    })
  );

  // Cookie parsing
  app.use(cookieParser());

  // Capture raw body for webhook signature verification (Meta, n8n)
  app.use(
    express.json({
      limit: '10mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );

  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global rate limiter
  app.use('/api', apiLimiter);

  // Health check endpoint
  app.get('/health', async (_req: Request, res: Response) => {
    let dbStatus = 'healthy';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'unhealthy';
    }

    const memoryUsage = process.memoryUsage();

    res.json({
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      database: dbStatus,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      },
    });
  });

  // API v1 Routes
  const apiV1 = express.Router();

  apiV1.use('/auth', authRoutes);
  apiV1.use('/users', usersRoutes);
  apiV1.use('/leads', leadsRoutes);
  apiV1.use('/campaigns', campaignsRoutes);
  apiV1.use('/meta-ads', metaAdsRoutes);
  apiV1.use('/instagram', instagramRoutes);
  apiV1.use('/attribution', attributionRoutes);
  apiV1.use('/webhooks', webhooksRoutes);
  apiV1.use('/dashboard', dashboardRoutes);
  apiV1.use('/ai', aiRoutes);
  apiV1.use('/automations', automationsRoutes);
  apiV1.use('/reports', reportsRoutes);
  apiV1.use('/integrations', integrationsRoutes);
  apiV1.use('/audit', auditRoutes);

  app.use('/api/v1', apiV1);

  // Serve static assets and SPA fallback if public directory exists
  const publicDir = process.env.PUBLIC_DIR || './public';
  import('node:path').then((path) => {
    import('node:fs').then((fs) => {
      const resolvedPublic = path.resolve(publicDir);
      if (fs.existsSync(resolvedPublic)) {
        app.use(express.static(resolvedPublic));
        app.get('*', (req: Request, res: Response, next) => {
          if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
            return next();
          }
          res.sendFile(path.join(resolvedPublic, 'index.html'));
        });
      }
    });
  });

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}
