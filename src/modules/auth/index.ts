import fp from 'fastify-plugin';
import { AuthService } from './application/auth.service.js';
import { authRoutes } from './http/auth.routes.js';

export const authModule = fp(async (app) => {
  const authService = new AuthService(app.usersRepository);
  app.decorate('authService', authService);
  await app.register(authRoutes);
});
