import { z } from 'zod';

export const applicationSchema = z.object({
  fullName: z.string().trim().min(3, 'Informe seu nome completo.').max(120),
  email: z.string().trim().email('Email inválido.').max(160),
  age: z.coerce.number().int().min(13, 'Idade mínima: 13 anos.').max(99),
  experience: z.string().trim().min(20, 'Explique melhor sua experiência.').max(3000),
  motivation: z.string().trim().min(20, 'Explique melhor sua motivação.').max(3000),
  links: z.string().trim().max(1200).optional().default('')
});

export const decisionSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  note: z.string().trim().max(1000).optional().default('')
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8)
});
