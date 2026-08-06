import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { validateEnv } from './src/backend/config/envConfig';
import { getCorsMiddleware } from './src/backend/middleware/corsMiddleware';
import { getSecurityHeadersMiddleware, explicitSecurityHeaders } from './src/backend/middleware/securityHeaders';
import { globalApiRateLimiter, authRateLimiter } from './src/backend/middleware/rateLimiter';
import { requestLogger } from './src/backend/middleware/requestLogger';
import { errorHandler } from './src/backend/middleware/errorHandler';
import authRouter from './src/backend/controllers/authController';
import userRouter from './src/backend/controllers/userController';

async function startServer() {
  // 1. Validate environment configuration
  const envConfig = validateEnv();

  const app = express();
  const PORT = Number(envConfig.PORT) || 3000;

  // Trust reverse proxy (e.g. Cloud Run, Nginx, load balancers) for accurate IP resolution in rate limiters
  app.set('trust proxy', 1);

  // 2. Global Security Headers (Helmet + Custom headers)
  app.use(getSecurityHeadersMiddleware());
  app.use(explicitSecurityHeaders);

  // 3. CORS Protection
  app.use(getCorsMiddleware());

  // 4. Body Parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 5. Request Logging
  app.use(requestLogger);

  // 6. Global API Rate Limiting
  app.use('/api', globalApiRateLimiter);

  // 7. Health Check Route
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Enterprise JWT Authentication Engine',
      environment: envConfig.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  // 8. Auth Router with strict Auth Rate Limiting
  app.use('/api/auth/login', authRateLimiter);
  app.use('/api/auth/signup', authRateLimiter);
  app.use('/api/auth/refresh', authRateLimiter);

  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);

  // 9. Vite Dev Server / Static SPA Fallback
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 10. Global Error Handling Middleware (must be registered last)
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔒 Enterprise Hardened Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot failure:', err);
  process.exit(1);
});
