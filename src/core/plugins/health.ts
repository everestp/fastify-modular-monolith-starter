import fp from 'fastify-plugin';

export const healthPlugin = fp(async (app) => {
  app.get('/healthz', async () => ({ status: 'ok' }));
  app.get('/readyz', async () => ({ status: 'ready' }));
  app.get('/version', async () => ({ version: '0.1.0' }));
});
