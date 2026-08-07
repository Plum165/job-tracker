import { Router, Response, NextFunction } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { applicationService } from '../services/applicationService';
import { updateApplicationStateSchema } from '../schemas/jobSchemas';

const router = Router();

router.use(authenticateToken);

/**
 * GET /api/applications
 * Get all application states for the authenticated user
 */
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const states = await applicationService.getUserApplications(req.user.userId);
    res.status(200).json({
      success: true,
      data: states,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/applications/:opportunityId
 * Get specific application state
 */
router.get('/:opportunityId', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const state = await applicationService.getOpportunityState(req.user.userId, req.params.opportunityId);
    res.status(200).json({
      success: true,
      data: state,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/applications/:opportunityId
 * Save/Update user application state
 */
router.put('/:opportunityId', validateRequest(updateApplicationStateSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const updated = await applicationService.saveApplicationState(req.user.userId, req.params.opportunityId, req.body);
    res.status(200).json({
      success: true,
      data: updated,
      message: 'Application state saved successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/applications/:opportunityId/status
 * Update application status specifically
 */
router.patch('/:opportunityId/status', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ success: false, message: 'Status is required' });
      return;
    }
    const updated = await applicationService.updateStatus(req.user.userId, req.params.opportunityId, status);
    res.status(200).json({
      success: true,
      data: updated,
      message: `Application status updated to ${status}`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/applications/:opportunityId/priority
 * Update application priority specifically
 */
router.patch('/:opportunityId/priority', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const { priority } = req.body;
    if (!priority) {
      res.status(400).json({ success: false, message: 'Priority is required' });
      return;
    }
    const updated = await applicationService.updatePriority(req.user.userId, req.params.opportunityId, priority);
    res.status(200).json({
      success: true,
      data: updated,
      message: `Priority updated to ${priority}`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
