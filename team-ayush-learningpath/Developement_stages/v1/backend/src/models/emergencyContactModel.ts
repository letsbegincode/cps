import mongoose, { Document, Schema } from 'mongoose';

export interface IEmergencyContact extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'abated' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const emergencyContactSchema = new Schema<IEmergencyContact>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['pending', 'abated', 'resolved'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.model<IEmergencyContact>('EmergencyContact', emergencyContactSchema);
