import { Router, Response, NextFunction } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { contactService } from '../services/contactService';
import { createContactSchema, updateContactSchema } from '../schemas/jobSchemas';

const router = Router();

router.use(authenticateToken);

/**
 * GET /api/contacts
 * Get contacts for authenticated user
 */
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const contacts = await contactService.getUserContacts(req.user.userId);
    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/contacts
 * Create new contact
 */
router.post('/', validateRequest(createContactSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const contact = await contactService.createContact(req.user.userId, req.body);
    res.status(201).json({
      success: true,
      data: contact,
      message: 'Contact created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/contacts/:id
 * Update contact
 */
router.patch('/:id', validateRequest(updateContactSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    const contact = await contactService.updateContact(req.user.userId, req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: contact,
      message: 'Contact updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/contacts/:id
 * Delete contact
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return;
    await contactService.deleteContact(req.user.userId, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
