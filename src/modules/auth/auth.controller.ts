import { Request, Response, NextFunction } from 'express';
import { registerOrgAndAdminService, loginUserService } from './auth.service.js';
import { AppError } from '../../middleware/errorMiddleware.js';

export const registerOrganization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organization, admin } = await registerOrgAndAdminService(req.body);

    res.status(201).json({
      success: true,
      message: 'Organization and Admin account registered successfully',
      data: {
        organization: { id: organization._id, name: organization.name, timezone: organization.timezone },
        admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
      },
    });
  } catch (error: any) {
    const appError: AppError = new Error(error.message);
    appError.statusCode = error.message === 'Email is already registered' ? 400 : 500;
    next(appError);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, user } = await loginUserService(req.body);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error: any) {
    const appError: AppError = new Error(error.message);
    appError.statusCode = 401;
    next(appError);
  }
};
