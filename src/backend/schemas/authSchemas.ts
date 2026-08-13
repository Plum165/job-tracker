import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Identifier (Email, Username, Student ID, or Employee ID) is required'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

export const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters long')
    .max(100, 'Full name cannot exceed 100 characters'),
  email: z
    .string()
    .trim()
    .email('Invalid email address format'),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username may only contain letters, numbers, underscores, and hyphens'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(100, 'Password cannot exceed 100 characters'),
  role: z.enum(['STUDENT', 'EMPLOYEE', 'ADMIN']).optional().default('STUDENT'),
  studentId: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform(val => val && val.length > 0 ? val : undefined),
  employeeId: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform(val => val && val.length > 0 ? val : undefined),
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .trim()
    .min(10, 'Refresh token format is invalid'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().trim().optional(),
});
