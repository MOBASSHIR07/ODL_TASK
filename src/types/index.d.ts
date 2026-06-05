import { Schema } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'ORG_ADMIN' | 'EMPLOYEE';
        tenantId: string;
      };
      tenantId?: string;
    }
  }
}
