import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { authLimiter } from '../middleware/rateLimits.js';
import { requireAdmin } from '../middleware/auth.js';
import { requireCsrf } from '../middleware/csrf.js';
import { adminIpWhitelist } from '../middleware/ipWhitelist.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { adminLoginSchema, decisionSchema } from '../validators/application.validator.js';
import { Admin } from '../models/Admin.js';
import { Application, type ApplicationStatus } from '../models/Application.js';
import { AuditLog } from '../models/AuditLog.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/tokens.js';
import { cookieOptions } from '../config/env.js';
import { writeAuditLog } from '../services/audit.service.js';
import { approvalMessage, rejectionMessage, sendCandidateDm } from '../services/discord.service.js';
import { sendDecisionEmail } from '../services/email.service.js';
import { registerRealtimeClient, broadcast } from '../services/realtime.service.js';
import { toCsv } from '../utils/csv.js';

export const adminRouter = Router();

adminRouter.use(adminIpWhitelist);

adminRouter.post(
  '/login',
  authLimiter,
  requireCsrf,
  asyncHandler(async (req, res) => {
    const data = adminLoginSchema.parse(req.body);
    const admin = await Admin.findOne({ email: data.email.toLowerCase() });

    if (!admin) throw new AppError(401, 'Credenciais inválidas.');

    const ok = await bcrypt.compare(data.password, admin.passwordHash);
    if (!ok) throw new AppError(401, 'Credenciais inválidas.');

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = signToken({
      type: 'admin',
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role
    });

    res.cookie('admin_token', token, { ...cookieOptions, maxAge: 8 * 60 * 60 * 1000 });

    await AuditLog.create({
      admin: admin._id,
      adminName: admin.name,
      action: 'admin.login',
      ip: req.ip,
      userAgent: req.headers['user-agent'] || ''
    });

    res.json({ admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  })
);

adminRouter.post('/logout', requireAdmin, (_req, res) => {
  res.clearCookie('admin_token', cookieOptions);
  res.json({ ok: true });
});

adminRouter.get('/me', requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

adminRouter.get(
  '/events',
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const cleanup = registerRealtimeClient(res);
    req.on('close', cleanup);
  })
);

adminRouter.get(
  '/candidates',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const status = String(req.query.status || 'all') as ApplicationStatus | 'all';
    const search = String(req.query.search || '').trim();
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);

    const query: Record<string, unknown> = {};
    if (status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { discordUsername: new RegExp(search, 'i') }
      ];
    }

    const [items, total, counts] = await Promise.all([
      Application.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Application.countDocuments(query),
      Application.aggregate([{ $group: { _id: '$status', total: { $sum: 1 } } }])
    ]);

    res.json({
      items,
      total,
      page,
      limit,
      counts: counts.reduce((acc, item) => ({ ...acc, [item._id]: item.total }), {})
    });
  })
);

adminRouter.get(
  '/candidates.csv',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const status = String(req.query.status || 'all') as ApplicationStatus | 'all';
    const query: Record<string, unknown> = {};
    if (status !== 'all') query.status = status;

    const candidates = await Application.find(query).sort({ createdAt: -1 }).lean();
    const csv = toCsv(
      candidates.map((candidate) => ({
        id: candidate._id.toString(),
        nome: candidate.fullName,
        email: candidate.email,
        idade: candidate.age,
        discord: `${candidate.discordUsername} (${candidate.discordId})`,
        status: candidate.status,
        enviado_em: candidate.submittedAt?.toISOString(),
        analisado_por: candidate.reviewedByName || '',
        analisado_em: candidate.reviewedAt?.toISOString() || '',
        observacao: candidate.reviewNote || '',
        links: candidate.links || ''
      }))
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="fluxo-candidatos-${status}.csv"`);
    res.send(`\uFEFF${csv}`);
  })
);

adminRouter.get(
  '/candidates/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const candidate = await Application.findById(req.params.id).lean();
    if (!candidate) throw new AppError(404, 'Candidato não encontrado.');
    res.json({ candidate });
  })
);

adminRouter.patch(
  '/candidates/:id/decision',
  requireAdmin,
  requireCsrf,
  asyncHandler(async (req, res) => {
    const data = decisionSchema.parse(req.body);
    const application = await Application.findById(req.params.id);
    if (!application) throw new AppError(404, 'Candidato não encontrado.');

    const previousStatus = application.status;
    if (previousStatus !== 'pending') {
      throw new AppError(409, 'Esta candidatura já foi analisada.');
    }

    application.status = data.decision;
    application.reviewedBy = req.admin!.id as never;
    application.reviewedByName = req.admin!.name;
    application.reviewedAt = new Date();
    application.reviewNote = data.note || '';
    application.history.push({
      action: data.decision === 'approved' ? 'approved' : 'rejected',
      from: previousStatus,
      to: data.decision,
      by: req.admin!.id as never,
      byName: req.admin!.name,
      note: data.note || '',
      at: new Date()
    });
    await application.save();

    await writeAuditLog(req, {
      action: `application.${data.decision}`,
      targetApplication: application._id,
      metadata: { previousStatus, nextStatus: data.decision, note: data.note }
    });

    const approved = data.decision === 'approved';

    await Promise.allSettled([
      sendCandidateDm(application.discordId, approved ? approvalMessage(application.fullName) : rejectionMessage(application.fullName)),
      sendDecisionEmail(application.email, application.fullName, approved, data.note)
    ]);

    broadcast('application.updated', {
      id: application._id,
      status: application.status,
      reviewedByName: application.reviewedByName,
      reviewedAt: application.reviewedAt
    });

    res.json({ candidate: application });
  })
);

adminRouter.get(
  '/audit-logs',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 30), 1), 100);

    const [items, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      AuditLog.countDocuments()
    ]);

    res.json({ items, total, page, limit });
  })
);
