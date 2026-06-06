import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export const notFound = () => {
  throw new AppError(404, 'Rota não encontrada.');
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(422).json({
      message: 'Dados inválidos.',
      errors: err.flatten().fieldErrors
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  console.error('Erro inesperado:', err);
  return res.status(500).json({
    message: 'Erro interno do servidor.',
    ...(env.NODE_ENV !== 'production' ? { stack: err?.stack } : {})
  });
};
