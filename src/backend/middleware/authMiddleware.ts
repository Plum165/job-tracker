import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AccessTokenPayload, UserRole } from '../types/auth';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'enterprise_access_token_secret_key_32_chars_min';

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
      error: 'Unauthorized',
      message: 'Access token missing or invalid format (Bearer <token>)',
    });
    return;
  }

  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET) as AccessTokenPayload;
    if (payload.tokenType !== 'access') {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token type provided for resource authorization',
      });
      return;
    }

    req.user = payload;
    next();
  } catch (err: any) {
    res.status(401).json({
      error: 'Unauthorized',
      message: err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token',
    });
  }
}

/**
 * Role-based authorization middleware
 */
export function authorizeRoles(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Role '${req.user.role}' does not have permission to access this resource`,
      });
      return;
    }

    next();
  };
}
