import { Request, Response, NextFunction } from 'express';
import { createEmployeeService, getAllEmployeesService } from './user.service.js';

export const createEmployeeController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminTenantId = req.user?.tenantId || req.tenantId;
    if (!adminTenantId) {
      res.status(401).json({ success: false, message: 'Unauthorized: Tenant ID missing' });
      return;
    }
    const { name, email, password } = req.body;

    const employee = await createEmployeeService(adminTenantId, {
      name,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      message: 'Employee onboarded successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEmployeesController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenantId;
    if (!tenantId) {
      res.status(401).json({ success: false, message: 'Unauthorized: Tenant ID missing' });
      return;
    }
    const employees = await getAllEmployeesService(tenantId);

    res.status(200).json({
      success: true,
      message: 'Employees retrieved successfully',
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};
