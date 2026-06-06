import type { RequestHandler } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

function normalize(ip: string) {
  return ip.replace('::ffff:', '').trim();
}

export const adminIpWhitelist: RequestHandler = (req, _res, next) => {
  const list = env.ADMIN_IP_WHITELIST.split(',').map((ip) => ip.trim()).filter(Boolean);
  if (!list.length) return next();

  const current = normalize(req.ip || req.socket.remoteAddress || '');
  if (!list.includes(current)) {
    return next(new AppError(403, 'Este IP não está autorizado a acessar o painel admin.'));
  }

  next();
};
