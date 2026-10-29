import { parseEnv } from './env.schema.js';

export const loadConfig = () => {
  const env = parseEnv();

  return {
    env,
    redacted: {
      NODE_ENV: env.NODE_ENV,
      HOST: env.HOST,
      PORT: env.PORT,
      LOG_LEVEL: env.LOG_LEVEL,
      DATABASE_URL: '[redacted]',
      JWT_SECRET: '[redacted]',
      JWT_ISSUER: env.JWT_ISSUER,
      JWT_AUDIENCE: env.JWT_AUDIENCE,
      SWAGGER_ENABLED: env.SWAGGER_ENABLED,
    },
  };
};
