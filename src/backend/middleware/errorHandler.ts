import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode = 400, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const statusCode = err.statusCode || err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  // Specific JWT Error Handling
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Authentication token has expired. Please log in again or refresh your session.',
      code: 'TOKEN_EXPIRED',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid token signature or malformed JWT token structure.',
      code: 'INVALID_TOKEN_SIGNATURE',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (err.name === 'NotBeforeError') {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'JWT token is not active yet.',
      code: 'TOKEN_NOT_ACTIVE',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Zod Validation Error Handling
  if (err instanceof ZodError) {
    const issues = err.issues || (err as any).errors || [];
    res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Invalid payload submitted',
      details: issues.map((e: any) => ({
        field: e.path ? e.path.join('.') : 'payload',
        message: e.message,
      })),
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Syntax / Bad JSON body parse error
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Malformed JSON payload supplied in request body',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.statusCode >= 500 ? 'Internal Error' : 'Request Error',
      message: err.message,
      details: err.details,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Generic 500 Internal Server Error
  console.error('Unhandled System Exception:', err);

  res.status(statusCode).json({
    success: false,
    error: statusCode >= 500 ? 'Internal Server Error' : 'Bad Request',
    message: isProd && statusCode >= 500 ? 'An unexpected system error occurred' : err.message || 'Error processing request',
    ...(isProd ? {} : { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
}
