import cors, { CorsOptions } from 'cors';
import { envConfig } from '../config/envConfig';

export function getCorsMiddleware() {
  const allowedOrigins = envConfig.CORS_ORIGIN.split(',').map((o) => o.trim());

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);

      if (envConfig.CORS_ORIGIN === '*' || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow Cloud Run dev preview URLs
      if (origin.endsWith('.run.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }

      callback(new Error(`Origin '${origin}' is not allowed by CORS policy`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Correlation-ID'],
    exposedHeaders: ['X-Total-Count', 'X-Correlation-ID'],
    maxAge: 86400, // 24 hours
  };

  return cors(corsOptions);
}
