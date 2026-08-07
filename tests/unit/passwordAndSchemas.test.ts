import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import { loginSchema, signupSchema, refreshTokenSchema } from '../../src/backend/schemas/authSchemas';

describe('Unit Test: Password Hashing & Security', () => {
  it('should hash plain-text passwords securely using bcrypt', async () => {
    const rawPassword = 'SecurePassword123!';
    const saltRounds = 10;
    const hash = await bcrypt.hash(rawPassword, saltRounds);

    expect(hash).not.toEqual(rawPassword);
    expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);

    const isValid = await bcrypt.compare(rawPassword, hash);
    expect(isValid).toBe(true);

    const isInvalid = await bcrypt.compare('WrongPassword', hash);
    expect(isInvalid).toBe(false);
  });
});

describe('Unit Test: Auth Zod Schemas Validation', () => {
  describe('loginSchema', () => {
    it('should validate valid email, student ID, employee ID, and username inputs', () => {
      expect(loginSchema.safeParse({ identifier: 'student@enterprise.io', password: 'pass' }).success).toBe(true);
      expect(loginSchema.safeParse({ identifier: 'STU001', password: 'pass' }).success).toBe(true);
      expect(loginSchema.safeParse({ identifier: 'EMP500', password: 'pass' }).success).toBe(true);
      expect(loginSchema.safeParse({ identifier: 'john_doe', password: 'pass' }).success).toBe(true);
    });

    it('should reject empty identifier or password', () => {
      expect(loginSchema.safeParse({ identifier: '', password: 'pass' }).success).toBe(false);
      expect(loginSchema.safeParse({ identifier: 'user', password: '' }).success).toBe(false);
    });
  });

  describe('signupSchema', () => {
    it('should accept valid user registration payloads', () => {
      const validPayload = {
        fullName: 'Jane Student',
        email: 'jane@enterprise.io',
        username: 'janestudent',
        password: 'SecurePassword123!',
        role: 'STUDENT',
        studentId: 'STU101',
      };
      const result = signupSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email formats or passwords under 6 characters', () => {
      const invalidEmailPayload = {
        fullName: 'Jane Student',
        email: 'not-an-email',
        username: 'janestudent',
        password: 'SecurePassword123!',
      };
      expect(signupSchema.safeParse(invalidEmailPayload).success).toBe(false);

      const shortPasswordPayload = {
        fullName: 'Jane Student',
        email: 'jane@enterprise.io',
        username: 'janestudent',
        password: '123',
      };
      expect(signupSchema.safeParse(shortPasswordPayload).success).toBe(false);
    });
  });

  describe('refreshTokenSchema', () => {
    it('should validate non-empty refresh token payload', () => {
      expect(refreshTokenSchema.safeParse({ refreshToken: 'valid.jwt.string.token' }).success).toBe(true);
      expect(refreshTokenSchema.safeParse({ refreshToken: '' }).success).toBe(false);
    });
  });
});
