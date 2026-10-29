import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import type { AppEnv } from '../../config/env.schema.js';

export const authPlugin = fp(async (app, opts: { config: AppEnv }) => {
  await app.register(jwt, {
    secret: opts.config.JWT_SECRET,
    sign: {
      iss: opts.config.JWT_ISSUER,
      aud: opts.config.JWT_AUDIENCE,
    },
    verify: {
      allowedIss: [opts.config.JWT_ISSUER],
      allowedAud: [opts.config.JWT_AUDIENCE],
    },
  });

  app.decorate('authenticate', async function (request) {
    await request.jwtVerify();
  });
});
