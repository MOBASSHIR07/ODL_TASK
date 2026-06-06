import { DateTime } from 'luxon';
import { Booking } from './booking.model.js';
import { Resource } from '../resource/resource.model.js';

export const createBookingService = async (
  tenantId: string,
  userId: string,
  payload: { resourceId: string; startTime: string; endTime: string }
) => {
  const { resourceId, startTime, endTime } = payload;

  
  const resource = await Resource.findOne({ _id: resourceId, tenantId, isDeleted: false });
  if (!resource) {
    throw new Error('Resource not found or unauthorized');
  }


  const reqStart = DateTime.fromISO(startTime).toUTC();
  const reqEnd = DateTime.fromISO(endTime).toUTC();

  if (!reqStart.isValid || !reqEnd.isValid) {
    throw new Error('Invalid date-time format provided');
  }

  if (reqEnd <= reqStart) {
    throw new Error('End time must be strictly after start time');
  }

  if (reqStart < DateTime.utc()) {
    throw new Error('Cannot book a time slot in the past');
  }

 
  const bufferMinutes = resource.bufferTime || 0;
  const reqStartMinusBuffer = reqStart.minus({ minutes: bufferMinutes });
  const reqEndWithBuffer = reqEnd.plus({ minutes: bufferMinutes });


  const overlappingBooking = await Booking.findOne({
    resourceId,
    tenantId,
    status: 'CONFIRMED',
    startTime: { $lt: reqEndWithBuffer.toJSDate() },
    endTime: { $gt: reqStartMinusBuffer.toJSDate() },
  });

  if (overlappingBooking) {
    throw new Error('This resource is already booked for the selected time slot (including buffer time)');
  }

 
  const newBooking = await Booking.create({
    tenantId,
    userId,
    resourceId,
    startTime: reqStart.toJSDate(),
    endTime: reqEnd.toJSDate(),
    status: 'CONFIRMED',
  });

  return newBooking;
};

export const getBookingsService = async (
  tenantId: string,
  userId: string,
  role: 'ORG_ADMIN' | 'EMPLOYEE'
) => {
  const query: Record<string, any> = { tenantId };

  if (role === 'EMPLOYEE') {
    query.userId = userId;
  }

  return await Booking.find(query).populate('resourceId');
};
