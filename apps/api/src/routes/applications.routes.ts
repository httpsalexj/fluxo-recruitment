import { Router } from 'express';
import { applicationLimiter } from '../middleware/rateLimits.js';
import { requireCandidate } from '../middleware/auth.js';
import { requireCsrf } from '../middleware/csrf.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { applicationSchema } from '../validators/application.validator.js';
import { Application } from '../models/Application.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { sendApplicationWebhook } from '../services/discord.service.js';
import { sendApplicationConfirmation } from '../services/email.service.js';
import { broadcast } from '../services/realtime.service.js';

export const applicationsRouter = Router();

applicationsRouter.get(
  '/me',
  requireCandidate,
  asyncHandler(async (req, res) => {
    const app = await Application.findOne({ user: req.candidate!.id }).sort({ createdAt: -1 }).lean();
    res.json({ application: app });
  })
);

applicationsRouter.post(
  '/',
  applicationLimiter,
  requireCandidate,
  requireCsrf,
  asyncHandler(async (req, res) => {
    const data = applicationSchema.parse(req.body);
    const existing = await Application.findOne({ user: req.candidate!.id, status: { $in: ['pending', 'approved'] } });
    if (existing) {
      throw new AppError(409, 'Você já possui uma candidatura em análise ou aprovada.');
    }

    const user = await User.findById(req.candidate!.id);
    if (!user) throw new AppError(401, 'Usuário Discord não encontrado. Faça login novamente.');

    const application = await Application.create({
      user: user._id,
      discordId: user.discordId,
      discordUsername: user.globalName || user.username,
      fullName: data.fullName,
      email: data.email,
      age: data.age,
      experience: data.experience,
      motivation: data.motivation,
      links: data.links,
      status: 'pending',
      history: [
        {
          action: 'created',
          to: 'pending',
          byName: user.globalName || user.username,
          note: 'Candidatura enviada pelo site.'
        }
      ]
    });

    await Promise.allSettled([
      sendApplicationWebhook(application),
      sendApplicationConfirmation(application.email, application.fullName)
    ]);

    broadcast('application.created', {
      id: application._id,
      fullName: application.fullName,
      email: application.email,
      status: application.status,
      submittedAt: application.submittedAt
    });

    res.status(201).json({ application });
  })
);
