import fp from 'fastify-plugin';

export const healthPlugin = fp(async (app) => {
  app.get('/healthz', async () => ({ status: 'ok' }));
  app.get('/readyz', async (_request, reply) => {
    if (app.db) {
      try {
        await app.db.query('SELECT 1');
      } catch {
        return reply.code(503).send({ status: 'not_ready' });
      }
    }

    return { status: 'ready' };
  });
  app.get('/version', async () => ({ version: '0.1.0' }));
});
