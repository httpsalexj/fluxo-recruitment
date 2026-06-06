import type { RequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';
import { verifyToken, type AdminTokenPayload, type CandidateTokenPayload } from '../utils/tokens.js';

function getBearer(req: Parameters<RequestHandler>[0]) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return undefined;
  return auth.slice('Bearer '.length);
}

export const requireCandidate: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.candidate_token || getBearer(req);
  if (!token) return next(new AppError(401, 'Login com Discord necessário.'));

  try {
    const payload = verifyToken<CandidateTokenPayload>(token);
    if (payload.type !== 'candidate') throw new Error('Invalid token type');
    req.candidate = payload;
    next();
  } catch {
    next(new AppError(401, 'Sessão inválida ou expirada.'));
  }
};

export const requireAdmin: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.admin_token || getBearer(req);
  if (!token) return next(new AppError(401, 'Login admin necessário.'));

  try {
    const payload = verifyToken<AdminTokenPayload>(token);
    if (payload.type !== 'admin') throw new Error('Invalid token type');
    req.admin = payload;
    next();
  } catch {
    next(new AppError(401, 'Sessão admin inválida ou expirada.'));
  }
};
