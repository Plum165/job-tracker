import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AccessTokenPayload, UserRole } from '../types/auth';
import { envConfig } from '../config/envConfig';

export interface AuthenticatedRequest extends Request {
  user?: AccessTokenPayload;
}

/**
 * Middleware to authenticate requests with JWT Access Token
 */
export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      code: 'MISSING_TOKEN',
      message: 'Access token missing or invalid format. Header format must be: Bearer <token>',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    const payload = jwt.verify(token, envConfig.JWT_ACCESS_SECRET) as AccessTokenPayload;
    if (payload.tokenType !== 'access') {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        code: 'INVALID_TOKEN_TYPE',
        message: 'Invalid token type provided for resource authorization. Access token required.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    req.user = payload;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        code: 'TOKEN_EXPIRED',
        message: 'Access token has expired. Please refresh your token.',
        expiredAt: err.expiredAt,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (err.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        code: 'INVALID_SIGNATURE',
        message: 'Invalid JWT access token signature or corrupted payload structure.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      code: 'AUTHENTICATION_FAILED',
      message: 'Failed to verify authorization token.',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Role-based authorization middleware
 */
export function authorizeRoles(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        code: 'NOT_AUTHENTICATED',
        message: 'User authentication required prior to permission check.',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `Role '${req.user.role}' lacks permission to access this resource. Required: [${roles.join(', ')}]`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}
