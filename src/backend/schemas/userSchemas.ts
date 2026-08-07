import { z } from 'zod';

export const editProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters long')
    .max(100, 'Full name cannot exceed 100 characters')
    .optional(),
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username may only contain letters, numbers, underscores, and hyphens')
    .optional(),
  email: z
    .string()
    .trim()
    .email('Invalid email address format')
    .optional(),
  avatarUrl: z
    .string()
    .trim()
    .max(200000, 'Avatar URL or image data exceeds maximum payload size')
    .optional(),
  bio: z
    .string()
    .trim()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional(),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark', 'system']).optional(),
      emailNotifications: z.boolean().optional(),
      twoFactorEnabled: z.boolean().optional(),
      language: z.string().optional(),
      displayMode: z.enum(['compact', 'comfortable']).optional(),
    })
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(6, 'New password must be at least 6 characters long')
    .max(100, 'New password cannot exceed 100 characters'),
});

export const deleteAccountSchema = z.object({
  password: z
    .string()
    .min(1, 'Password confirmation is required to delete account'),
});

export const updateRoleSchema = z.object({
  role: z.enum(['STUDENT', 'EMPLOYEE', 'ADMIN'], {
    message: 'Role must be STUDENT, EMPLOYEE, or ADMIN',
  }),
});
