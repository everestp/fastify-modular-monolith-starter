import Fastify from 'fastify';
import { Pool } from 'pg';
import { loadConfig } from './config/index.js';
import { authPlugin } from './core/plugins/auth.js';
import { errorHandlerPlugin } from './core/plugins/error-handler.js';
import { healthPlugin } from './core/plugins/health.js';
import { requestContextPlugin } from './core/plugins/request-context.js';
import { securityPlugin } from './core/plugins/security.js';
import { swaggerPlugin } from './core/plugins/swagger.js';
import { PostgresNotesRepository } from './modules/notes/infrastructure/postgres-notes.repository.js';
import { PostgresUsersRepository } from './modules/users/infrastructure/postgres-users.repository.js';
import type { NotesRepository } from './modules/notes/domain/notes.repository.js';
import type { UsersRepository } from './modules/users/domain/users.repository.js';
import { v1Router } from './versions/v1.js';

export const buildApp = async (repositories?: {
  users?: UsersRepository;
  notes?: NotesRepository;
}) => {
  const config = loadConfig();

  const app = Fastify({
    logger: {
      level: config.env.LOG_LEVEL,
      transport:
        config.env.NODE_ENV !== 'production'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
              },
            }
          : undefined,
    },
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId',
  });

  app.decorate('config', config.env);
  const pool =
    repositories?.users && repositories.notes
      ? null
      : new Pool({ connectionString: config.env.DATABASE_URL });
  app.decorate('db', pool);
  if (pool) {
    app.addHook('onClose', async () => pool.end());
  }

  await app.register(requestContextPlugin);
  await app.register(securityPlugin, { config: config.env });
  await app.register(authPlugin, { config: config.env });
  await app.register(swaggerPlugin, { enabled: config.env.SWAGGER_ENABLED });
  await app.register(errorHandlerPlugin);
  await app.register(healthPlugin);
  await app.register(v1Router, {
    usersRepository: repositories?.users ?? new PostgresUsersRepository(pool!),
    notesRepository: repositories?.notes ?? new PostgresNotesRepository(pool!),
  });

  return { app, config };
};
