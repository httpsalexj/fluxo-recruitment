import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    discordId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true },
    globalName: { type: String, default: '' },
    avatar: { type: String, default: '' },
    email: { type: String, default: '' },
    lastLoginAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema>;
export const User = model('User', userSchema);
