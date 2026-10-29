import 'fastify';
import type { AppEnv } from '../../config/env.schema.js';
import type { AuthService } from '../../modules/auth/application/auth.service.js';
import type { NotesRepository } from '../../modules/notes/domain/notes.repository.js';
import type { NotesService } from '../../modules/notes/application/notes.service.js';
import type { UsersRepository } from '../../modules/users/domain/users.repository.js';
import type { Pool } from 'pg';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    config: AppEnv;
    authService: AuthService;
    db: Pool | null;
    usersRepository: UsersRepository;
    notesService: NotesService;
    notesRepository: NotesRepository;
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
