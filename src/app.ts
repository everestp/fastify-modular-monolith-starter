import Fastify from 'fastify';
import { loadConfig } from './config/index.js';
import { authPlugin } from './core/plugins/auth.js';
import { errorHandlerPlugin } from './core/plugins/error-handler.js';
import { healthPlugin } from './core/plugins/health.js';
import { requestContextPlugin } from './core/plugins/request-context.js';
import { securityPlugin } from './core/plugins/security.js';
import { swaggerPlugin } from './core/plugins/swagger.js';
import { AuthService } from './modules/auth/application/auth.service.js';
import { authRoutes } from './modules/auth/http/auth.routes.js';
import { NotesService } from './modules/notes/application/notes.service.js';
import { InMemoryNotesRepository } from './modules/notes/infrastructure/notes.repository.js';
import { notesRoutes } from './modules/notes/http/notes.routes.js';
import { usersModule } from './modules/users/index.js';

export const buildApp = async () => {
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

  await app.register(requestContextPlugin);
  await app.register(securityPlugin, { config: config.env });
  await app.register(authPlugin, { config: config.env });
  await app.register(swaggerPlugin, { enabled: config.env.SWAGGER_ENABLED });
  await app.register(errorHandlerPlugin);
  await app.register(healthPlugin);
  await app.register(usersModule);
  app.decorate('authService', new AuthService(app.usersRepository));
  app.decorate('notesService', new NotesService(new InMemoryNotesRepository()));
  await app.register(authRoutes);
  await app.register(notesRoutes);

  return { app, config };
};
