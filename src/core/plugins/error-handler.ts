import fp from 'fastify-plugin';

export const errorHandlerPlugin = fp(async (app) => {
  app.setErrorHandler((error, request, reply) => {
    const err = error as Error & { statusCode?: number };
    const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;

    const payload = {
      type: 'https://example.com/problems/internal-error',
      title: statusCode >= 500 ? 'Internal Server Error' : 'Request Failed',
      status: statusCode,
      detail: err.message,
      instance: request.url,
      requestId: request.id,
    };

    reply.code(statusCode).type('application/problem+json').send(payload);
  });

  app.setNotFoundHandler((request, reply) => {
    reply
      .code(404)
      .type('application/problem+json')
      .send({
        type: 'https://example.com/problems/not-found',
        title: 'Not Found',
        status: 404,
        detail: `Route not found: ${request.method} ${request.url}`,
        instance: request.url,
        requestId: request.id,
      });
  });
});
