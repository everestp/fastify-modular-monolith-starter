import { Type, type Static } from '@sinclair/typebox';
import { Value } from '@sinclair/typebox/value';

const EnvSchema = Type.Object({
  NODE_ENV: Type.Union(
    [Type.Literal('development'), Type.Literal('test'), Type.Literal('production')],
    { default: 'development' },
  ),
  HOST: Type.String({ default: '0.0.0.0' }),
  PORT: Type.Number({ default: 3000, minimum: 1, maximum: 65535 }),
  LOG_LEVEL: Type.String({ default: 'info' }),
  DATABASE_URL: Type.String({ default: 'postgres://postgres:postgres@localhost:5432/app' }),
  JWT_SECRET: Type.String({ minLength: 32, default: 'change-me-change-me-change-me-123456' }),
  JWT_ISSUER: Type.String({ default: 'fastify-modular-monolith-starter' }),
  JWT_AUDIENCE: Type.String({ default: 'fastify-modular-monolith-starter' }),
  ACCESS_TOKEN_TTL: Type.String({ default: '15m' }),
  REFRESH_TOKEN_TTL: Type.String({ default: '7d' }),
  CORS_ALLOWED_ORIGINS: Type.String({ default: 'http://localhost:3000,http://localhost:5173' }),
  RATE_LIMIT_MAX: Type.Number({ default: 100, minimum: 1 }),
  RATE_LIMIT_WINDOW: Type.Number({ default: 60000, minimum: 1000 }),
  TRUST_PROXY: Type.Union([Type.Boolean(), Type.Number(), Type.String()], { default: false }),
  SWAGGER_ENABLED: Type.Boolean({ default: true }),
});

export type AppEnv = Static<typeof EnvSchema>;

const toNumber = (value: string | undefined, fallback: number) => {
  if (value === undefined || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined || value === '') {
    return fallback;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return fallback;
};

export const parseEnv = (input: NodeJS.ProcessEnv = process.env): AppEnv => {
  const raw = {
    NODE_ENV: input.NODE_ENV ?? 'development',
    HOST: input.HOST ?? '0.0.0.0',
    PORT: toNumber(input.PORT, 3000),
    LOG_LEVEL: input.LOG_LEVEL ?? 'info',
    DATABASE_URL: input.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/app',
    JWT_SECRET: input.JWT_SECRET ?? 'change-me-change-me-change-me-123456',
    JWT_ISSUER: input.JWT_ISSUER ?? 'fastify-modular-monolith-starter',
    JWT_AUDIENCE: input.JWT_AUDIENCE ?? 'fastify-modular-monolith-starter',
    ACCESS_TOKEN_TTL: input.ACCESS_TOKEN_TTL ?? '15m',
    REFRESH_TOKEN_TTL: input.REFRESH_TOKEN_TTL ?? '7d',
    CORS_ALLOWED_ORIGINS:
      input.CORS_ALLOWED_ORIGINS ?? 'http://localhost:3000,http://localhost:5173',
    RATE_LIMIT_MAX: toNumber(input.RATE_LIMIT_MAX, 100),
    RATE_LIMIT_WINDOW: toNumber(input.RATE_LIMIT_WINDOW, 60000),
    TRUST_PROXY:
      input.TRUST_PROXY === undefined
        ? false
        : input.TRUST_PROXY === 'true'
          ? true
          : input.TRUST_PROXY === 'false'
            ? false
            : Number.isFinite(Number(input.TRUST_PROXY))
              ? Number(input.TRUST_PROXY)
              : input.TRUST_PROXY,
    SWAGGER_ENABLED: toBoolean(input.SWAGGER_ENABLED, true),
  };

  return Value.Parse(EnvSchema, raw);
};
