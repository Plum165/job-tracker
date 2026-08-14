import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createExpressApp } from '../../src/backend/createApp';

const app = createExpressApp();

describe('API Test: Authentication Routes (/api/auth)', () => {
  const apiTestUser = {
    fullName: 'API Test User',
    email: 'apitest@enterprise.io',
    username: 'api_test_user',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    role: 'STUDENT',
  };

  let accessToken = '';
  let refreshToken = '';

  it('POST /api/auth/signup - Should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(apiTestUser)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(apiTestUser.email);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    expect(res.body.data.tokens.refreshToken).toBeDefined();

    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
  });

  it('POST /api/auth/login - Should authenticate user and return tokens', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: apiTestUser.email,
        password: apiTestUser.password,
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(apiTestUser.email);
    expect(res.body.data.tokens.accessToken).toBeDefined();

    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
  });

  it('GET /api/auth/me - Should return authenticated profile with valid Bearer JWT', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(apiTestUser.email);
  });

  it('GET /api/auth/me - Should reject unauthenticated request', async () => {
    await request(app)
      .get('/api/auth/me')
      .expect(401);
  });

  it('POST /api/auth/refresh - Should issue new tokens upon refresh', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();

    refreshToken = res.body.data.refreshToken;
  });

  it('POST /api/auth/login - Should reject passwords shorter than 6 characters', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: apiTestUser.email,
        password: '12345',
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Password must be at least 6 characters long');
  });

  it('POST /api/auth/signup - Should reject mismatched confirm password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        ...apiTestUser,
        email: 'mismatch@enterprise.io',
        username: 'mismatch_user',
        password: 'Password123!',
        confirmPassword: 'WrongPassword',
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Passwords do not match');
  });

  it('POST /api/auth/logout - Should revoke current session', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken })
      .expect(200);

    expect(res.body.success).toBe(true);
  });
});
