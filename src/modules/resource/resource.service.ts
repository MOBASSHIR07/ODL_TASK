import { Resource } from './resource.model.js';

export const createResourceService = async (data: {
  name: string;
  type: 'MEETING_ROOM' | 'DESK' | 'DEVICE';
  bufferTime: number;
  tenantId: string;
}) => {
  const { name, type, bufferTime, tenantId } = data;

  const existingResource = await Resource.findOne({ tenantId, name, isDeleted: false });
  if (existingResource) {
    throw new Error('Resource with this name already exists in your organization');
  }

  const resource = await Resource.create({
    name,
    type,
    bufferTime,
    tenantId,
  });

  return resource;
};

export const getAllResourcesService = async (tenantId: string) => {
  return await Resource.find({ tenantId, isDeleted: false });
};

export const getResourceByIdService = async (id: string, tenantId: string) => {
  const resource = await Resource.findOne({ _id: id, tenantId, isDeleted: false });
  if (!resource) {
    throw new Error('Resource not found');
  }
  return resource;
};

export const updateResourceService = async (
  id: string,
  tenantId: string,
  updateData: { name?: string; type?: 'MEETING_ROOM' | 'DESK' | 'DEVICE'; bufferTime?: number }
) => {
  if (updateData.name) {
    const existingResource = await Resource.findOne({
      tenantId,
      name: updateData.name,
      _id: { $ne: id },
      isDeleted: false,
    });
    if (existingResource) {
      throw new Error('Another resource with this name already exists');
    }
  }

  const resource = await Resource.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { $set: updateData },
    { new: true }
  );

  if (!resource) {
    throw new Error('Resource not found or unauthorized');
  }

  return resource;
};

export const deleteResourceService = async (id: string, tenantId: string) => {
  const resource = await Resource.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!resource) {
    throw new Error('Resource not found or unauthorized');
  }

  return { message: 'Resource soft-deleted successfully' };
};
