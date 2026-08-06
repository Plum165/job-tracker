import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateRequest(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues || (error as any).errors || [];
        const formattedErrors = issues.map((err: any) => ({
          field: err.path ? err.path.join('.') : 'payload',
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Request payload failed schema validation checks',
          details: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
}
