import type { Request } from 'express';
import { AuditLog } from '../models/AuditLog.js';

export async function writeAuditLog(
  req: Request,
  input: {
    action: string;
    targetApplication?: unknown;
    metadata?: Record<string, unknown>;
  }
) {
  await AuditLog.create({
    admin: req.admin?.id,
    adminName: req.admin?.name || 'Sistema',
    action: input.action,
    targetApplication: input.targetApplication,
    metadata: input.metadata || {},
    ip: req.ip,
    userAgent: req.headers['user-agent'] || ''
  });
}
