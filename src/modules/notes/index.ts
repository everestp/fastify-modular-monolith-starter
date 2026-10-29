import fp from 'fastify-plugin';
import { NotesService } from './application/notes.service.js';
import type { NotesRepository } from './domain/notes.repository.js';
import { notesRoutes } from './http/notes.routes.js';

export const notesModule = fp(async (app, opts: { repository: NotesRepository }) => {
  const notesService = new NotesService(opts.repository);
  app.decorate('notesRepository', opts.repository);
  app.decorate('notesService', notesService);
  await app.register(notesRoutes);
});
