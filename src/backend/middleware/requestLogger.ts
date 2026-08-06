import { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const method = req.method;
  const url = req.originalUrl || req.url;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusCategory = Math.floor(statusCode / 100);

    let logMessage = `[HTTP] ${method} ${url} ${statusCode} - ${duration}ms (${ip})`;

    if (statusCategory === 5) {
      console.error(`🚨 ${logMessage}`);
    } else if (statusCategory === 4) {
      console.warn(`⚠️ ${logMessage}`);
    } else {
      console.log(`ℹ️ ${logMessage}`);
    }
  });

  next();
}

/**
 * Utility function to sanitize sensitive body objects for safe debugging/logging
 */
export function sanitizePayload(body: Record<string, any>): Record<string, any> {
  if (!body || typeof body !== 'object') return body;

  const sanitized = { ...body };
  const sensitiveKeys = ['password', 'token', 'accessToken', 'refreshToken', 'secret', 'passwordHash'];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizePayload(sanitized[key]);
    }
  }

  return sanitized;
}
