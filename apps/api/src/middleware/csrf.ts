import crypto from 'crypto';
import type { RequestHandler } from 'express';
import { isProduction } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const csrfCookieName = 'csrf_token';

export const createCsrfToken: RequestHandler = (_req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(csrfCookieName, token, {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  });
  res.json({ csrfToken: token });
};

export const requireCsrf: RequestHandler = (req, _res, next) => {
  const safe = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  if (safe) return next();

  const cookieToken = req.cookies?.[csrfCookieName];
  const headerToken = req.header('x-csrf-token');

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new AppError(403, 'CSRF token inválido. Atualize a página e tente novamente.'));
  }

  next();
};
