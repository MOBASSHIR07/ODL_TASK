import { Schema, model, Document } from 'mongoose';

export interface IBooking extends Document {
  tenantId: Schema.Types.ObjectId;
  resourceId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    resourceId: { type: Schema.Types.ObjectId, ref: 'Resource', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['CONFIRMED', 'CANCELLED'], default: 'CONFIRMED' },
  },
  { timestamps: true }
);

bookingSchema.index({ tenantId: 1, resourceId: 1, startTime: 1, endTime: 1 });

export const Booking = model<IBooking>('Booking', bookingSchema);
