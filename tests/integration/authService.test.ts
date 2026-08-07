import { describe, it, expect } from 'vitest';
import { authService } from '../../src/backend/services/authService';

describe('Integration Test: AuthService End-to-End Flow', () => {
  const testUser = {
    fullName: 'Integration Test User',
    email: 'integration@enterprise.io',
    username: 'integration_user',
    password: 'Password123!',
    role: 'STUDENT' as const,
    studentId: 'STU777888',
  };

  it('1. Should register a new user and return Dual JWT Tokens (15m Access, 7d Refresh)', async () => {
    const signupResult = await authService.signup(testUser);

    expect(signupResult.user.email).toBe(testUser.email);
    expect(signupResult.user.username).toBe(testUser.username);
    expect(signupResult.user.role).toBe('STUDENT');
    expect(signupResult.user).not.toHaveProperty('passwordHash');

    expect(signupResult.tokens.accessToken).toBeDefined();
    expect(signupResult.tokens.refreshToken).toBeDefined();
    expect(signupResult.tokens.expiresIn).toBe(900); // 15 minutes = 900 seconds
    expect(signupResult.detectedIdentifierType).toBe('EMAIL');
  });

  it('2. Should support multi-identifier login (Email, Student ID, Username)', async () => {
    // Login with Email
    const loginByEmail = await authService.login({
      identifier: testUser.email,
      password: testUser.password,
    });
    expect(loginByEmail.user.email).toBe(testUser.email);
    expect(loginByEmail.detectedIdentifierType).toBe('EMAIL');

    // Login with Student ID
    const loginByStudentId = await authService.login({
      identifier: testUser.studentId,
      password: testUser.password,
    });
    expect(loginByStudentId.user.studentId).toBe(testUser.studentId);
    expect(loginByStudentId.detectedIdentifierType).toBe('STUDENT_ID');

    // Login with Username
    const loginByUsername = await authService.login({
      identifier: testUser.username,
      password: testUser.password,
    });
    expect(loginByUsername.user.username).toBe(testUser.username);
    expect(loginByUsername.detectedIdentifierType).toBe('USERNAME');
  });

  it('3. Should reject login with invalid password', async () => {
    await expect(
      authService.login({
        identifier: testUser.email,
        password: 'WrongPassword!',
      })
    ).rejects.toThrow('Invalid credentials');
  });

  it('4. Should perform token rotation on token refresh', async () => {
    const loginRes = await authService.login({
      identifier: testUser.email,
      password: testUser.password,
    });

    const initialRefreshToken = loginRes.tokens.refreshToken;

    const refreshed = await authService.refreshTokens(initialRefreshToken);

    expect(refreshed.accessToken).toBeDefined();
    expect(refreshed.refreshToken).toBeDefined();
    expect(refreshed.refreshToken).not.toEqual(initialRefreshToken);
  });

  it('5. Should detect Replay Attack and revoke ALL user sessions when a revoked refresh token is reused', async () => {
    const loginRes = await authService.login({
      identifier: testUser.email,
      password: testUser.password,
    });

    const token1 = loginRes.tokens.refreshToken;

    // First refresh: rotates token1 -> token2 and revokes token1
    const refresh1 = await authService.refreshTokens(token1);
    const token2 = refresh1.refreshToken;

    // REPLAY ATTACK: Attacker tries to use the OLD (revoked) token1 again!
    await expect(authService.refreshTokens(token1)).rejects.toThrow(
      'Security Alert: Revoked token reuse detected. All active sessions invalidated.'
    );

    // After replay attack detection, token2 is also revoked, so using token2 triggers replay attack security alert
    await expect(authService.refreshTokens(token2)).rejects.toThrow(
      'Security Alert: Revoked token reuse detected. All active sessions invalidated.'
    );
  });

  it('6. Should revoke session on logout', async () => {
    const loginRes = await authService.login({
      identifier: testUser.email,
      password: testUser.password,
    });

    const refreshToken = loginRes.tokens.refreshToken;

    // Logout
    await authService.logout(refreshToken);

    // Refresh attempt with logged out token should fail as revoked token reuse
    await expect(authService.refreshTokens(refreshToken)).rejects.toThrow(
      'Security Alert: Revoked token reuse detected. All active sessions invalidated.'
    );
  });
});
