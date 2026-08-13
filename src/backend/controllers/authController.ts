import { Router, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { userRepository } from '../repository/userRepository';
import { tokenRepository } from '../repository/tokenRepository';
import { validateRequest } from '../middleware/validateRequest';
import { loginSchema, signupSchema, refreshTokenSchema, logoutSchema } from '../schemas/authSchemas';

const router = Router();

/**
 * POST /api/auth/login
 * Multi-Identifier login (Email, Student ID, Employee ID, Username)
 */
router.post('/login', validateRequest(loginSchema), async (req, res, next: NextFunction) => {
  try {
    const { identifier, password } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.login({ identifier, password }, ipAddress, userAgent);

    res.status(200).json({
      success: true,
      data: result,
      message: `Successfully authenticated using ${result.detectedIdentifierType} identifier`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/signup
 */
router.post('/signup', validateRequest(signupSchema), async (req, res, next: NextFunction) => {
  try {
    const { fullName, email, username, password, role, studentId, employeeId } = req.body;

    // Validate required fields
    if (!fullName || !email || !username || !password) {
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Missing required fields: fullName, email, username, password',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.signup(
      { fullName, email, username, password, role, studentId, employeeId },
      ipAddress,
      userAgent
    );

    res.status(201).json({
      success: true,
      data: result,
      message: 'Account created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/refresh
 * Refresh token rotation with revocation tracking & replay detection
 */
router.post('/refresh', validateRequest(refreshTokenSchema), async (req, res, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.refreshTokens(refreshToken, ipAddress, userAgent);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Tokens rotated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', validateRequest(logoutSchema), async (req, res, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Protected user profile route
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized', message: 'Not authenticated' });
      return;
    }

    const user = await userRepository.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'Not Found', message: 'User profile not found' });
      return;
    }

    const { passwordHash, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        tokenClaims: req.user,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/active-sessions
 * Protected route to inspect active sessions
 */
router.get('/active-sessions', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const sessions = await tokenRepository.getActiveSessions(req.user.userId);
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions.map((s) => ({
        id: s.id,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/revoke-all
 * Emergency logout all active sessions
 */
router.post('/revoke-all', authenticateToken, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    await tokenRepository.revokeAllUserTokens(req.user.userId);
    res.status(200).json({
      success: true,
      message: 'All active refresh tokens revoked for user',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/demo-credentials
 * Helper endpoint for UI testing multi-identifier login
 */
router.get('/demo-credentials', async (req, res) => {
  res.status(200).json({
    message: 'Enterprise Multi-Identifier Demo Login Credentials (Password for all: Password123!)',
    demoAccounts: [
      {
        name: 'Multi-ID Admin User',
        identifiers: {
          email: 'architect@enterprise.io',
          studentId: 'STU98765',
          employeeId: 'EMP102',
          username: 'architect99',
        },
        password: 'Password123!',
        role: 'ADMIN',
      },
      {
        name: 'Graduate Student User',
        identifiers: {
          email: 'student@university.edu',
          studentId: 'STU54321',
          username: 'jordan_student',
        },
        password: 'Password123!',
        role: 'STUDENT',
      },
      {
        name: 'Senior Employee User',
        identifiers: {
          email: 'employee@company.com',
          employeeId: 'EMP808',
          username: 'taylor_dev',
        },
        password: 'Password123!',
        role: 'EMPLOYEE',
      },
    ],
  });
});

export default router;
