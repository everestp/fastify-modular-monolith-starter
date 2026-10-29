import fp from 'fastify-plugin';

export const requestContextPlugin = fp(async (app) => {
  app.addHook('onRequest', async (request, reply) => {
    request.log = request.log.child({ requestId: request.id });
    reply.header('x-request-id', request.id);
  });
});
