import { Schema, model, type InferSchemaType } from 'mongoose';

const adminSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['owner', 'manager'], default: 'manager' },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

export type AdminDocument = InferSchemaType<typeof adminSchema> & { _id: unknown };
export const Admin = model('Admin', adminSchema);
