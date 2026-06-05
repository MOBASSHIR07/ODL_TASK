import { Schema, model, Document, Types } from 'mongoose';

export interface IResource extends Document {
  name: string;
  type: 'MEETING_ROOM' | 'DESK' | 'DEVICE';
  bufferTime: number;
  tenantId: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const resourceSchema = new Schema<IResource>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['MEETING_ROOM', 'DESK', 'DEVICE'], required: true },
    bufferTime: { type: Number, default: 0 },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

resourceSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export const Resource = model<IResource>('Resource', resourceSchema);
