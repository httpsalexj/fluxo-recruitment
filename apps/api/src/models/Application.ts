import { Schema, model, type InferSchemaType, Types } from 'mongoose';

const applicationHistorySchema = new Schema(
  {
    action: { type: String, required: true },
    from: { type: String, default: '' },
    to: { type: String, default: '' },
    by: { type: Schema.Types.ObjectId, ref: 'Admin' },
    byName: { type: String, default: 'Sistema' },
    note: { type: String, default: '' },
    at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const applicationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    discordId: { type: String, required: true, index: true },
    discordUsername: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    age: { type: Number, required: true, min: 13, max: 99 },
    experience: { type: String, required: true, trim: true },
    motivation: { type: String, required: true, trim: true },
    links: { type: String, default: '', trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    reviewedByName: { type: String, default: '' },
    reviewedAt: { type: Date },
    reviewNote: { type: String, default: '' },
    history: { type: [applicationHistorySchema], default: [] },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

applicationSchema.index({ fullName: 'text', email: 'text', discordUsername: 'text' });
applicationSchema.index({ user: 1, status: 1 });

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type ApplicationDocument = InferSchemaType<typeof applicationSchema> & { _id: Types.ObjectId };
export const Application = model('Application', applicationSchema);
