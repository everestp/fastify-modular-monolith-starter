import fp from 'fastify-plugin';
import type { NotesRepository } from '../modules/notes/domain/notes.repository.js';
import { notesModule } from '../modules/notes/index.js';
import type { UsersRepository } from '../modules/users/domain/users.repository.js';
import { usersModule } from '../modules/users/index.js';
import { authModule } from '../modules/auth/index.js';

export const v1Router = fp(
  async (app, options: { usersRepository: UsersRepository; notesRepository: NotesRepository }) => {
    await app.register(usersModule, { repository: options.usersRepository });
    await app.register(authModule);
    await app.register(notesModule, { repository: options.notesRepository });
  },
);
