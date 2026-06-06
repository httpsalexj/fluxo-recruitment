import { Schema, model, type InferSchemaType } from 'mongoose';

const auditLogSchema = new Schema(
  {
    admin: { type: Schema.Types.ObjectId, ref: 'Admin' },
    adminName: { type: String, default: 'Sistema' },
    action: { type: String, required: true, index: true },
    targetApplication: { type: Schema.Types.ObjectId, ref: 'Application' },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export type AuditLogDocument = InferSchemaType<typeof auditLogSchema>;
export const AuditLog = model('AuditLog', auditLogSchema);
