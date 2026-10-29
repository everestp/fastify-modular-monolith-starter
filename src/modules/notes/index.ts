import fp from 'fastify-plugin';
import { NotesService } from './application/notes.service.js';
import { InMemoryNotesRepository } from './infrastructure/notes.repository.js';
import { notesRoutes } from './http/notes.routes.js';

export const notesModule = fp(async (app) => {
  const notesRepository = new InMemoryNotesRepository();
  const notesService = new NotesService(notesRepository);
  app.decorate('notesService', notesService);
  await app.register(notesRoutes, { prefix: '/notes' });
});
