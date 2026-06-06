import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import crypto from 'crypto';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { globalLimiter } from './middleware/rateLimits.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.routes.js';
import { applicationsRouter } from './routes/applications.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { bootstrapAdmin } from './bootstrap/admin.js';

const app = express();

app.set('trust proxy', 1);

app.use((req, _res, next) => {
  req.requestId = crypto.randomUUID();
  next();
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
  })
);
app.use(globalLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'fluxo-api', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/admin', adminRouter);
app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDatabase();
  await bootstrapAdmin();
  app.listen(env.API_PORT, () => {
    console.log(`🚀 API rodando em ${env.API_URL}`);
  });
}

start().catch((error) => {
  console.error('❌ Falha ao iniciar API:', error);
  process.exit(1);
});
