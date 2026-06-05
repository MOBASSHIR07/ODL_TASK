import { Schema, model, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  timezone: string;
  isActive: boolean;
  bookingPolicy: {
    workingHours: {
      start: string;
      end: string;
    };
    maxBookingDays: number;
    minDuration: number;
    maxDuration: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true, trim: true },
    timezone: { type: String, required: true, default: 'UTC' },
    isActive: { type: Boolean, default: true },
    bookingPolicy: {
      workingHours: {
        start: { type: String, default: '09:00' },
        end: { type: String, default: '18:00' },
      },
      maxBookingDays: { type: Number, default: 30 },
      minDuration: { type: Number, default: 30 },
      maxDuration: { type: Number, default: 480 },
    },
  },
  { timestamps: true }
);

export const Organization = model<IOrganization>('Organization', organizationSchema);
