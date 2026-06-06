import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().default(3333),
  API_URL: z.string().url().default('http://localhost:3333'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET precisa ter pelo menos 32 caracteres.'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  COOKIE_DOMAIN: z.string().optional().default(''),
  ADMIN_IP_WHITELIST: z.string().optional().default(''),
  ADMIN_BOOTSTRAP_NAME: z.string().optional().default('Administrador Fluxo'),
  ADMIN_BOOTSTRAP_EMAIL: z.string().email().optional(),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().min(8).optional(),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_CLIENT_SECRET: z.string().min(1),
  DISCORD_REDIRECT_URI: z.string().url(),
  DISCORD_SCOPES: z.string().default('identify email'),
  DISCORD_BOT_TOKEN: z.string().optional().default(''),
  DISCORD_WEBHOOK_URL: z.string().url().optional().or(z.literal('')).default(''),
  DISCORD_GUILD_ID: z.string().optional().default(''),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().optional().default('Fluxo Store <no-reply@fluxostore.local>')
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Variáveis de ambiente inválidas:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';

export const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  domain: env.COOKIE_DOMAIN || undefined,
  path: '/'
};
