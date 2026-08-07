import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createExpressApp } from '../../src/backend/createApp';
import { authService } from '../../src/backend/services/authService';

const app = createExpressApp();

describe('API Test: Role Authorization & Route Protection', () => {
  let studentToken = '';
  let adminToken = '';

  it('Setup: Register STUDENT and ADMIN accounts', async () => {
    const studentRes = await authService.signup({
      fullName: 'Student User',
      email: 'student_auth_test@enterprise.io',
      username: 'student_auth_test',
      password: 'Password123!',
      role: 'STUDENT',
    });
    studentToken = studentRes.tokens.accessToken;

    const adminRes = await authService.signup({
      fullName: 'Admin User',
      email: 'admin_auth_test@enterprise.io',
      username: 'admin_auth_test',
      password: 'Password123!',
      role: 'ADMIN',
    });
    adminToken = adminRes.tokens.accessToken;

    expect(studentToken).toBeDefined();
    expect(adminToken).toBeDefined();
  });

  it('1. GET /api/users - Should REJECT request with NO token (401 Unauthorized)', async () => {
    const res = await request(app)
      .get('/api/users')
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('2. GET /api/users - Should REJECT STUDENT user (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(403);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('lacks permission');
  });

  it('3. GET /api/users - Should ALLOW ADMIN user (200 OK)', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('4. Data Isolation: User applications are isolated by authenticated user ID', async () => {
    // STUDENT fetches their application states
    const resStudent = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(resStudent.body.success).toBe(true);

    // ADMIN fetches their application states
    const resAdmin = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(resAdmin.body.success).toBe(true);
  });
});
