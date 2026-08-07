import { Router, Response, NextFunction } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { jobService } from '../services/jobService';
import { createJobSchema, updateJobSchema } from '../schemas/jobSchemas';

const router = Router();

// Protect all job endpoints with JWT
router.use(authenticateToken);

/**
 * GET /api/jobs
 * Get all visible jobs for the user (Public catalog + user created)
 */
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const jobs = await jobService.getVisibleJobs(req.user.userId);
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/jobs/public
 * Get public catalog jobs only
 */
router.get('/public', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const jobs = await jobService.getPublicJobs();
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/jobs/mine
 * Get user private jobs only
 */
router.get('/mine', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const jobs = await jobService.getUserPrivateJobs(req.user.userId);
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/jobs
 * Create new job application opportunity
 */
router.post('/', validateRequest(createJobSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const job = await jobService.createJob(req.user.userId, req.body);
    res.status(201).json({
      success: true,
      data: job,
      message: 'Job opportunity created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/jobs/:id
 * Update job opportunity
 */
router.patch('/:id', validateRequest(updateJobSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const job = await jobService.updateJob(req.user.userId, req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: job,
      message: 'Job opportunity updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/jobs/:id
 * Delete job opportunity
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    await jobService.deleteJob(req.user.userId, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Job opportunity deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
