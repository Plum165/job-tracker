export const MIN_PASSWORD_LENGTH = 6;

export function validatePassword(password: unknown, fieldLabel = 'Password'): string | null {
  if (typeof password !== 'string') {
    return `${fieldLabel} is required.`;
  }

  if (password.trim().length === 0) {
    return `${fieldLabel} is required.`;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `${fieldLabel} must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }

  return null;
}

export function validateLoginForm(identifier: string, password: string): string | null {
  if (!identifier.trim()) {
    return 'Email or username is required.';
  }

  return validatePassword(password, 'Password');
}

export function validateSignupForm(payload: {
  fullName?: string;
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}): string | null {
  if (!payload.fullName?.trim()) {
    return 'Full name is required.';
  }

  if (!payload.email?.trim()) {
    return 'Email is required.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(payload.email.trim())) {
    return 'Please enter a valid email address.';
  }

  if (!payload.username?.trim()) {
    return 'Username is required.';
  }

  if (payload.username.trim().length < 3) {
    return 'Username must be at least 3 characters long.';
  }

  const passwordError = validatePassword(payload.password, 'Password');
  if (passwordError) {
    return passwordError;
  }

  if (payload.confirmPassword !== undefined && payload.confirmPassword !== payload.password) {
    return 'Passwords do not match.';
  }

  return null;
}

export function getAuthErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const candidate = (err as { response?: { data?: { message?: string; error?: string } }; message?: string }).response?.data?.message
      ?? (err as { response?: { data?: { message?: string; error?: string } }; message?: string }).response?.data?.error
      ?? (err as { message?: string }).message;

    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }

  if (typeof err === 'string' && err.trim()) {
    return err;
  }

  return fallback;
}
