import fp from 'fastify-plugin';
import { InMemoryUsersRepository } from './infrastructure/users.repository.js';

export const usersModule = fp(async (app) => {
  app.decorate('usersRepository', new InMemoryUsersRepository());
});
