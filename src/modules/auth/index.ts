import fp from 'fastify-plugin';
import type { AppEnv } from '../../config/env.schema.js';
import { AuthService } from './application/auth.service.js';
import { authRoutes } from './http/auth.routes.js';

export const authModule = fp(async (app, opts: { config: AppEnv }) => {
  const authService = new AuthService(app.usersRepository);
  app.decorate('authService', authService);
  await app.register(authRoutes, { config: opts.config, prefix: '/auth' });
});
