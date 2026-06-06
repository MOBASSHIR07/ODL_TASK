import { Request, Response, NextFunction } from 'express';
import {
  createResourceService,
  getAllResourcesService,
  getResourceByIdService,
  updateResourceService,
  deleteResourceService,
} from './resource.service.js';

export const createResourceController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenantId;
    if (!tenantId) {
      res.status(401).json({ success: false, message: 'Unauthorized: Tenant ID missing' });
      return;
    }
    const { name, type, bufferTime } = req.body;

    const resource = await createResourceService({
      name,
      type,
      bufferTime,
      tenantId,
    });

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllResourcesController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenantId;
    if (!tenantId) {
      res.status(401).json({ success: false, message: 'Unauthorized: Tenant ID missing' });
      return;
    }
    const resources = await getAllResourcesService(tenantId);

    res.status(200).json({
      success: true,
      message: 'Resources retrieved successfully',
      data: resources,
    });
  } catch (error) {
    next(error);
  }
};

export const getResourceByIdController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenantId;
    if (!tenantId) {
      res.status(401).json({ success: false, message: 'Unauthorized: Tenant ID missing' });
      return;
    }
    const id = req.params.id as string;

    const resource = await getResourceByIdService(id, tenantId);

    res.status(200).json({
      success: true,
      message: 'Resource retrieved successfully',
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

export const updateResourceController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenantId;
    if (!tenantId) {
      res.status(401).json({ success: false, message: 'Unauthorized: Tenant ID missing' });
      return;
    }
    const id = req.params.id as string;

    const updatedResource = await updateResourceService(id, tenantId, req.body);

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully',
      data: updatedResource,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResourceController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenantId;
    if (!tenantId) {
      res.status(401).json({ success: false, message: 'Unauthorized: Tenant ID missing' });
      return;
    }
    const id = req.params.id as string;

    const result = await deleteResourceService(id, tenantId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
