import fp from 'fastify-plugin';
import type { UsersRepository } from './domain/users.repository.js';

export const usersModule = fp(async (app, opts: { repository: UsersRepository }) => {
  app.decorate('usersRepository', opts.repository);
});
