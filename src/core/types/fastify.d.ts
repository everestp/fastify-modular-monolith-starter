import 'fastify';
import type { AppEnv } from '../../config/env.schema.js';
import type { AuthService } from '../../modules/auth/application/auth.service.js';
import type { InMemoryNotesRepository } from '../../modules/notes/infrastructure/notes.repository.js';
import type { NotesService } from '../../modules/notes/application/notes.service.js';
import type { InMemoryUsersRepository } from '../../modules/users/infrastructure/users.repository.js';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    config: AppEnv;
    authService: AuthService;
    usersRepository: InMemoryUsersRepository;
    notesService: NotesService;
    notesRepository: InMemoryNotesRepository;
  }

  interface FastifyRequest {
    user?: {
      sub: string;
      email?: string;
      iat?: number;
      exp?: number;
    };
  }
}
