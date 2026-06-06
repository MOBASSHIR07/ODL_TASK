import { DateTime } from 'luxon';
import { Booking } from './booking.model.js';
import { Resource } from '../resource/resource.model.js';
import { Organization } from '../organization/organization.model.js';

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

export const cancelBookingService = async (
  bookingId: string,
  tenantId: string,
  userId: string,
  role: 'ORG_ADMIN' | 'EMPLOYEE'
) => {
  const booking = await Booking.findOne({ _id: bookingId, tenantId });
  if (!booking) {
    throw new Error('Booking not found or unauthorized');
  }

  if (role === 'EMPLOYEE' && booking.userId.toString() !== userId) {
    throw new Error('Unauthorized: You can only cancel your own bookings');
  }

  booking.status = 'CANCELLED';
  await booking.save();

  return booking;
};

export const getAvailabilityService = async (
  tenantId: string,
  resourceId: string,
  date: string
) => {
  const resource = await Resource.findOne({ _id: resourceId, tenantId, isDeleted: false });
  if (!resource) {
    throw new Error('Resource not found or unauthorized');
  }

  const org = await Organization.findById(tenantId);
  if (!org) {
    throw new Error('Organization not found');
  }

  const timezone = org.timezone || 'UTC';
  const workingHours = org.bookingPolicy?.workingHours || { start: '09:00', end: '18:00' };
  const slotDuration = org.bookingPolicy?.minDuration || 30;

  const [startHour, startMinute] = workingHours.start.split(':').map(Number);
  const [endHour, endMinute] = workingHours.end.split(':').map(Number);

  const localDate = DateTime.fromISO(date, { zone: timezone });
  if (!localDate.isValid) {
    throw new Error('Invalid date format provided');
  }

  const localWorkStart = localDate.set({ hour: startHour, minute: startMinute, second: 0, millisecond: 0 });
  const localWorkEnd = localDate.set({ hour: endHour, minute: endMinute, second: 0, millisecond: 0 });

  const utcWorkStart = localWorkStart.toUTC();
  const utcWorkEnd = localWorkEnd.toUTC();


  const bookings = await Booking.find({
    resourceId,
    tenantId,
    status: 'CONFIRMED',
    startTime: { $lt: utcWorkEnd.toJSDate() },
    endTime: { $gt: utcWorkStart.toJSDate() },
  });

  const availableSlots: { startTime: string; endTime: string }[] = [];
  let currentSlotStart = utcWorkStart;

  const bufferMinutes = resource.bufferTime || 0;
  const now = DateTime.utc();

  while (currentSlotStart.plus({ minutes: slotDuration }) <= utcWorkEnd) {
    const currentSlotEnd = currentSlotStart.plus({ minutes: slotDuration });

    if (currentSlotStart < now) {
      currentSlotStart = currentSlotEnd;
      continue;
    }

    const bufferedSlotStart = currentSlotStart.minus({ minutes: bufferMinutes });
    const bufferedSlotEnd = currentSlotEnd.plus({ minutes: bufferMinutes });

    let hasOverlap = false;
    for (const booking of bookings) {
      const bStart = DateTime.fromJSDate(booking.startTime);
      const bEnd = DateTime.fromJSDate(booking.endTime);

      if (bStart < bufferedSlotEnd && bEnd > bufferedSlotStart) {
        hasOverlap = true;
        break;
      }
    }

    if (!hasOverlap) {
      availableSlots.push({
        startTime: currentSlotStart.toISO()!,
        endTime: currentSlotEnd.toISO()!,
      });
    }

    currentSlotStart = currentSlotEnd;
  
  }

  return availableSlots;
};
