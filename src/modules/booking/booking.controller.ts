import { Request, Response, NextFunction } from 'express';
import { createBookingService, getBookingsService, cancelBookingService } from './booking.service.js';

export const createBookingController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenantId;
    const userId = req.user?.id;

    if (!tenantId || !userId) {
      res.status(401).json({ success: false, message: 'Unauthorized: Missing authentication context' });
      return;
    }

    const { resourceId, startTime, endTime } = req.body;

    const booking = await createBookingService(tenantId, userId, {
      resourceId,
      startTime,
      endTime,
    });

    res.status(201).json({
      success: true,
      message: 'Resource booked successfully',
      data: booking,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create booking',
    });
  }
};

export const getBookingsController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenantId;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!tenantId || !userId || !role) {
      res.status(401).json({ success: false, message: 'Unauthorized: Missing authentication context' });
      return;
    }

    const bookings = await getBookingsService(tenantId, userId, role);

    res.status(200).json({
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
    });
  } catch (error: any) {
    next(error);
  }
};

export const cancelBookingController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId || req.tenantId;
    const userId = req.user?.id;
    const role = req.user?.role;
    const bookingId = req.params.id as string;

    if (!tenantId || !userId || !role || !bookingId) {
      res.status(401).json({ success: false, message: 'Unauthorized: Missing authentication context' });
      return;
    }

    const booking = await cancelBookingService(bookingId, tenantId, userId, role);

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to cancel booking',
    });
  }
};
