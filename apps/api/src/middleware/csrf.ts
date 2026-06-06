import crypto from "crypto";
import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const CSRF_TTL_MS = 10 * 60 * 1000;

function sign(payload: string) {
  return crypto.createHmac("sha256", env.JWT_SECRET).update(payload).digest("hex");
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

export const csrfCookieName = "csrf_token";

export const createCsrfToken: RequestHandler = (_req, res) => {
  const nonce = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + CSRF_TTL_MS;
  const payload = `${nonce}.${expiresAt}`;
  const signature = sign(payload);

  res.json({
    csrfToken: `${payload}.${signature}`
  });
};

export const requireCsrf: RequestHandler = (req, _res, next) => {
  const safe = ["GET", "HEAD", "OPTIONS"].includes(req.method);
  if (safe) return next();

  const token = req.header("x-csrf-token");

  if (!token) {
    return next(new AppError(403, "CSRF token inválido. Atualize a página e tente novamente."));
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return next(new AppError(403, "CSRF token inválido. Atualize a página e tente novamente."));
  }

  const [nonce, expiresAtRaw, signature] = parts;
  const expiresAt = Number(expiresAtRaw);

  if (!nonce || !expiresAt || Date.now() > expiresAt) {
    return next(new AppError(403, "CSRF token expirado. Atualize a página e tente novamente."));
  }

  const expected = sign(`${nonce}.${expiresAt}`);

  if (!safeEqual(signature, expected)) {
    return next(new AppError(403, "CSRF token inválido. Atualize a página e tente novamente."));
  }

  next();
};