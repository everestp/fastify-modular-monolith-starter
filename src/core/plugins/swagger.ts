import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

export const swaggerPlugin = fp(async (app, opts: { enabled: boolean }) => {
  if (!opts.enabled) {
    return;
  }

  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Fastify Modular Monolith Starter',
        version: '0.1.0',
      },
      servers: [{ url: '/' }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  });
});
