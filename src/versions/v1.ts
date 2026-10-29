import fp from 'fastify-plugin';
import { authRoutes } from '../modules/auth/http/auth.routes.js';
import { notesRoutes } from '../modules/notes/http/notes.routes.js';

export const v1Router = fp(async (app) => {
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(notesRoutes, { prefix: '/notes' });
});
