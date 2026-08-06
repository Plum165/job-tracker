import { Router, Response, NextFunction } from 'express';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { userService } from '../services/userService';
import { auditService } from '../services/auditService';
import {
  editProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
  updateRoleSchema,
} from '../schemas/userSchemas';

const router = Router();

// All user management routes require JWT authentication
router.use(authenticateToken);

/**
 * GET /api/users/me
 * View current user profile
 */
router.get('/me', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const profile = await userService.getUserProfile(req.user.userId);

    res.status(200).json({
      success: true,
      data: profile,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/users/me
 * Edit user profile & preferences
 */
router.patch('/me', validateRequest(editProfileSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const updatedProfile = await userService.updateUserProfile(req.user.userId, req.body, ipAddress, userAgent);

    res.status(200).json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/users/password
 * Change password with current password verification
 */
router.patch('/password', validateRequest(changePasswordSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await userService.changePassword(req.user.userId, req.body, ipAddress, userAgent);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. All active refresh tokens have been invalidated for security.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/users/me
 * Delete user account with password verification
 */
router.delete('/me', validateRequest(deleteAccountSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await userService.deleteAccount(req.user.userId, req.body, ipAddress, userAgent);

    res.status(200).json({
      success: true,
      message: 'Account successfully deleted. All associated session tokens revoked.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users/me/audit-logs
 * Get audit logs for current user
 */
router.get('/me/audit-logs', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const logs = auditService.getUserAuditLogs(req.user.userId);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users
 * Admin endpoint: List all users
 */
router.get('/', authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/users/:userId/role
 * Admin endpoint: Update a user's role
 */
router.patch('/:userId/role', authorizeRoles('ADMIN'), validateRequest(updateRoleSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const { userId } = req.params;
    const { role } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const updatedUser = await userService.updateUserRole(req.user.userId, userId, role, ipAddress, userAgent);

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: `User role successfully updated to '${role}'`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/users/:userId
 * Admin endpoint: Delete any user account
 */
router.delete('/:userId', authorizeRoles('ADMIN'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const { userId } = req.params;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await userService.adminDeleteUser(req.user.userId, userId, ipAddress, userAgent);

    res.status(200).json({
      success: true,
      message: `User account '${userId}' has been permanently deleted by administrator.`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
