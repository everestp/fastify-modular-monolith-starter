import { Type } from '@sinclair/typebox';

export const RegisterBodySchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 8, maxLength: 128 }),
});

export const LoginBodySchema = RegisterBodySchema;

export const RefreshBodySchema = Type.Object({
  refreshToken: Type.String({ minLength: 1 }),
});

export const UserResponseSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
  createdAt: Type.String(),
});

export const AuthTokensSchema = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.String(),
  user: UserResponseSchema,
});
