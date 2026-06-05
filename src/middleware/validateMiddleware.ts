import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as any;

      req.body = parsed.body;
      if (parsed.query) {
        Object.assign(req.query, parsed.query);
      }
      if (parsed.params) {
        Object.assign(req.params, parsed.params);
      }

      next();
    } catch (error: any) {
      console.error('DEBUG - Validation Middleware Error:', error);
      res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: error.issues?.map((err: any) => ({
          field: err.path.slice(1).join('.') || err.path[0] || 'unknown',
          message: err.message,
        })) || [],
      });
    }
  };
};
