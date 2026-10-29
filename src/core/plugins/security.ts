import fp from 'fastify-plugin';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import type { AppEnv } from '../../config/env.schema.js';

export const securityPlugin = fp(async (app, opts: { config: AppEnv }) => {
  await app.register(helmet);

  const origins = opts.config.CORS_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim());
  await app.register(cors, {
    origin: origins,
    credentials: true,
  });

  await app.register(rateLimit, {
    max: opts.config.RATE_LIMIT_MAX,
    timeWindow: opts.config.RATE_LIMIT_WINDOW,
  });
});
