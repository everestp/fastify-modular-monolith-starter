import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('auth and notes flow', () => {
  let app: Awaited<ReturnType<typeof buildApp>>['app'];

  beforeAll(async () => {
    ({ app } = await buildApp());
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a user and returns a token pair', async () => {
    const body = {
      email: 'demo@example.com',
      password: 'Secret123!',
    };

    const registerResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: body,
    });

    expect(registerResponse.statusCode).toBe(201);

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: body,
    });

    expect(loginResponse.statusCode).toBe(200);
    const loginBody = loginResponse.json();
    expect(typeof loginBody.accessToken).toBe('string');
    expect(typeof loginBody.refreshToken).toBe('string');
    expect(loginBody.user.email).toBe(body.email);
  });

  it('allows an authenticated user to create and list notes', async () => {
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'demo@example.com',
        password: 'Secret123!',
      },
    });

    const accessToken = loginResponse.json().accessToken;

    const createNoteResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/notes',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        title: 'First note',
        content: 'This is a test note',
      },
    });

    expect(createNoteResponse.statusCode).toBe(201);
    const note = createNoteResponse.json();
    expect(note.title).toBe('First note');

    const listResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/notes',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toHaveLength(1);
  });
});
