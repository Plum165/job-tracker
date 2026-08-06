import { Router, Response } from 'express';
import { authService } from '../services/authService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { userRepository } from '../repository/userRepository';
import { tokenRepository } from '../repository/tokenRepository';

const router = Router();

/**
 * POST /api/auth/login
 * Multi-Identifier login (Email, Student ID, Employee ID, Username)
 */
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.login({ identifier, password }, ipAddress, userAgent);

    res.status(200).json({
      success: true,
      data: result,
      message: `Successfully authenticated using ${result.detectedIdentifierType} identifier`,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: 'Authentication failed',
      message: err.message || 'Invalid credentials',
    });
  }
});

/**
 * POST /api/auth/signup
 */
router.post('/signup', async (req, res) => {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.signup(req.body, ipAddress, userAgent);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Account created successfully',
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: 'Signup failed',
      message: err.message || 'Could not register user',
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh token rotation with revocation tracking
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await authService.refreshTokens(refreshToken, ipAddress, userAgent);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Tokens rotated successfully',
    });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: 'Token refresh failed',
      message: err.message || 'Invalid or revoked refresh token',
    });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err: any) {
    res.status(200).json({
      success: true,
      message: 'Session cleared',
    });
  }
});

/**
 * GET /api/auth/me
 * Protected user profile route
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await userRepository.findById(req.user.userId);
    if (!user) {
      res.status(444).json({ error: 'User not found' });
      return;
    }

    const { passwordHash, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        tokenClaims: req.user,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * GET /api/auth/active-sessions
 * Protected route to inspect active sessions
 */
router.get('/active-sessions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
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
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch active sessions' });
  }
});

/**
 * POST /api/auth/revoke-all
 * Emergency logout all sessions
 */
router.post('/revoke-all', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return;
    await tokenRepository.revokeAllUserTokens(req.user.userId);
    res.status(200).json({
      success: true,
      message: 'All active refresh tokens revoked for user',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to revoke sessions' });
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
