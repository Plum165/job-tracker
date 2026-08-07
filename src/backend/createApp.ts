import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { envConfig } from './config/envConfig';
import { getCorsMiddleware } from './middleware/corsMiddleware';
import { getSecurityHeadersMiddleware, explicitSecurityHeaders } from './middleware/securityHeaders';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './controllers/authController';
import userRouter from './controllers/userController';
import jobRouter from './controllers/jobController';
import applicationRouter from './controllers/applicationController';
import contactRouter from './controllers/contactController';

import { prisma } from './lib/prisma';

export function createExpressApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(getSecurityHeadersMiddleware());
  app.use(explicitSecurityHeaders);
  app.use(getCorsMiddleware());

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use(requestLogger);

  app.get('/api/health', async (req, res) => {
    let dbStatus = 'healthy';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'degraded_memory_fallback';
    }

    res.json({
      status: 'ok',
      service: 'Opportunity Hub API',
      environment: envConfig.NODE_ENV,
      uptimeSeconds: Math.floor(process.uptime()),
      database: dbStatus,
      memoryUsage: {
        rssMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
        heapUsedMb: Math.round(process.memoryUsage().heapUsed / (1024 * 1024)),
      },
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/jobs', jobRouter);
  app.use('/api/applications', applicationRouter);
  app.use('/api/contacts', contactRouter);

  app.use(errorHandler);

  return app;
}
