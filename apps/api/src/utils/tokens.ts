import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type CandidateTokenPayload = {
  type: 'candidate';
  id: string;
  discordId: string;
  email?: string;
  username?: string;
};

export type AdminTokenPayload = {
  type: 'admin';
  id: string;
  email: string;
  name: string;
  role: string;
};

export function signToken(payload: CandidateTokenPayload | AdminTokenPayload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export function verifyToken<T>(token: string): T {
  return jwt.verify(token, env.JWT_SECRET) as T;
}
