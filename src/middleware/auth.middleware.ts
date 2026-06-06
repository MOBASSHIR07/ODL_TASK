import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorMiddleware.js';

interface DecodedToken {
  userId: string;
  role: 'ORG_ADMIN' | 'EMPLOYEE';
  tenantId: string;
}

export const auth = (...roles: ('ORG_ADMIN' | 'EMPLOYEE')[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      let token = '';

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
      }

      if (!token) {
        const error: AppError = new Error('Authentication required');
        error.statusCode = 401;
        return next(error);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

      req.user = {
        id: decoded.userId,
        role: decoded.role,
        tenantId: decoded.tenantId,
      };
      req.tenantId = decoded.tenantId;

      if (roles.length > 0 && !roles.includes(req.user.role)) {
        const error: AppError = new Error('Forbidden: You do not have permission to perform this action');
        error.statusCode = 403;
        return next(error);
      }

      next();
    } catch (error: any) {
      const appError: AppError = new Error('Invalid or expired token');
      appError.statusCode = 401;
      next(appError);
    }
  };
};
