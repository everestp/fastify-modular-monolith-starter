import fp from 'fastify-plugin';
import { Type } from '@sinclair/typebox';
import {
  AuthTokensSchema,
  LoginBodySchema,
  RefreshBodySchema,
  RegisterBodySchema,
  UserResponseSchema,
} from './auth.schemas.js';

export const authRoutes = fp(async (app) => {
  const accessTokenTtl = app.config?.ACCESS_TOKEN_TTL ?? '15m';
  const refreshTokenTtl = app.config?.REFRESH_TOKEN_TTL ?? '7d';

  app.post(
    '/api/v1/auth/register',
    {
      schema: {
        body: RegisterBodySchema,
        response: {
          201: UserResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body as { email: string; password: string };
      const user = await app.authService.register({ email, password });
      return reply.code(201).send(user);
    },
  );

  app.post(
    '/api/v1/auth/login',
    {
      schema: {
        body: LoginBodySchema,
        response: {
          200: AuthTokensSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body as { email: string; password: string };
      const result = await app.authService.login({
        email,
        password,
        issueToken: async (userId, userEmail, type) =>
          app.jwt.sign(
            {
              sub: userId,
              email: userEmail,
              type,
            },
            {
              expiresIn: type === 'access' ? accessTokenTtl : refreshTokenTtl,
            },
          ),
      });

      return reply.code(200).send(result);
    },
  );

  app.post(
    '/api/v1/auth/refresh',
    {
      schema: {
        body: RefreshBodySchema,
        response: {
          200: Type.Object({
            accessToken: Type.String(),
            refreshToken: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      const payload = await app.jwt.verify<{ sub: string; email: string }>(
        (request.body as { refreshToken: string }).refreshToken,
      );
      const result = await app.authService.refresh({
        userId: payload.sub,
        issueToken: async (userId, userEmail, type) =>
          app.jwt.sign(
            {
              sub: userId,
              email: userEmail,
              type,
            },
            {
              expiresIn: type === 'access' ? accessTokenTtl : refreshTokenTtl,
            },
          ),
      });

      return reply.code(200).send(result);
    },
  );

  app.get(
    '/api/v1/auth/me',
    {
      preValidation: [app.authenticate],
      schema: {
        response: {
          200: UserResponseSchema,
        },
      },
    },
    async (request) => {
      const userId = (request.user as { sub?: string } | undefined)?.sub;
      if (!userId) {
        throw new Error('Unauthorized.');
      }

      const user = await app.authService.getById(userId);
      if (!user) {
        throw new Error('User not found.');
      }

      return user;
    },
  );
});
