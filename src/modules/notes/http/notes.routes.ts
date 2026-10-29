import fp from 'fastify-plugin';
import { Type } from '@sinclair/typebox';
import { CreateNoteBodySchema, NoteSchema, UpdateNoteBodySchema } from './notes.schemas.js';

export const notesRoutes = fp(async (app) => {
  app.post(
    '/api/v1/notes',
    {
      preHandler: [app.authenticate],
      schema: {
        body: CreateNoteBodySchema,
        response: {
          201: NoteSchema,
        },
      },
    },
    async (request, reply) => {
      const { title, content } = request.body as { title: string; content: string };
      const userId = (request.user as { sub?: string } | undefined)?.sub;
      if (!userId) {
        throw new Error('User not authenticated.');
      }

      const note = await app.notesService.create({ userId, title, content });
      return reply.code(201).send(note);
    },
  );

  app.get(
    '/api/v1/notes',
    {
      preHandler: [app.authenticate],
      schema: {
        response: {
          200: Type.Array(NoteSchema),
        },
      },
    },
    async (request) => {
      const userId = (request.user as { sub?: string } | undefined)?.sub;
      if (!userId) {
        throw new Error('User not authenticated.');
      }

      return app.notesService.list(userId);
    },
  );

  app.get(
    '/api/v1/notes/:id',
    {
      preHandler: [app.authenticate],
      schema: {
        response: {
          200: NoteSchema,
          404: Type.Object({ message: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const userId = (request.user as { sub?: string } | undefined)?.sub;
      const noteId = (request.params as { id: string }).id;
      if (!userId) {
        throw new Error('User not authenticated.');
      }

      const note = await app.notesService.get(userId, noteId);
      if (!note) {
        return reply.code(404).send({ message: 'Note not found.' });
      }

      return note;
    },
  );

  app.put(
    '/api/v1/notes/:id',
    {
      preHandler: [app.authenticate],
      schema: {
        body: UpdateNoteBodySchema,
        response: {
          200: NoteSchema,
          404: Type.Object({ message: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const userId = (request.user as { sub?: string } | undefined)?.sub;
      const noteId = (request.params as { id: string }).id;
      const payload = request.body as { title?: string; content?: string };
      if (!userId) {
        throw new Error('User not authenticated.');
      }

      try {
        const note = await app.notesService.update(userId, noteId, payload);
        return reply.code(200).send(note);
      } catch (error) {
        return reply.code(404).send({ message: (error as Error).message });
      }
    },
  );

  app.delete(
    '/api/v1/notes/:id',
    {
      preHandler: [app.authenticate],
      schema: {
        response: {
          200: Type.Object({
            success: Type.Boolean(),
          }),
          404: Type.Object({ message: Type.String() }),
        },
      },
    },
    async (request, reply) => {
      const userId = (request.user as { sub?: string } | undefined)?.sub;
      const noteId = (request.params as { id: string }).id;
      if (!userId) {
        throw new Error('User not authenticated.');
      }

      try {
        await app.notesService.remove(userId, noteId);
        return reply.code(200).send({ success: true });
      } catch (error) {
        return reply.code(404).send({ message: (error as Error).message });
      }
    },
  );
});
