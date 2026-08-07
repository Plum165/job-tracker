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

export function createExpressApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(getSecurityHeadersMiddleware());
  app.use(explicitSecurityHeaders);
  app.use(getCorsMiddleware());

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use(requestLogger);

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Enterprise JWT Authentication Engine',
      environment: envConfig.NODE_ENV,
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
