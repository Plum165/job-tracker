import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { validateEnv } from './src/backend/config/envConfig';
import { globalApiRateLimiter, authRateLimiter } from './src/backend/middleware/rateLimiter';
import { createExpressApp } from './src/backend/createApp';

async function startServer() {
  const envConfig = validateEnv();
  const PORT = Number(envConfig.PORT) || 3000;

  const app = createExpressApp();

  // Attach rate limiters
  app.use('/api', globalApiRateLimiter);
  app.use('/api/auth/login', authRateLimiter);
  app.use('/api/auth/signup', authRateLimiter);
  app.use('/api/auth/refresh', authRateLimiter);

  // Vite Dev Server / Static SPA Fallback
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔒 Enterprise Hardened Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot failure:', err);
  process.exit(1);
});

