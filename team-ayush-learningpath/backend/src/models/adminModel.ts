import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role: 'admin';
    avatarUrl?: string;
    permissions?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String },
        role: { type: String, enum: ['admin'], default: 'admin' },
        avatarUrl: { type: String },
        permissions: [{ type: String }],
    },
    { timestamps: true }
);

export default mongoose.model<IAdmin>('Admin', adminSchema);
