import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role: 'admin';
    avatarUrl?: string;
    permissions?: string[];
    todos?: string[];
    createdAt: Date;
    updatedAt: Date;
    isModified: (field: string) => boolean;
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
        todos: [{ type: String, default: [] }],
    },
    { timestamps: true }
);

// Hash password before saving
adminSchema.pre<IAdmin>('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

export default mongoose.model<IAdmin>('Admin', adminSchema);
