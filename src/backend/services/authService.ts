import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { detectIdentifierType } from '../utils/identifierDetector';
import { userRepository } from '../repository/userRepository';
import { tokenRepository } from '../repository/tokenRepository';
import {
  AccessTokenPayload,
  AuthSuccessResponse,
  LoginDTO,
  RefreshTokenPayload,
  RefreshTokenRecord,
  SignupDTO,
  User,
} from '../types/auth';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'enterprise_access_token_secret_key_32_chars_min';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'enterprise_refresh_token_secret_key_32_chars_min';

const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60;
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export class AuthService {
  /**
   * Login with multi-identifier support (Email, Student ID, Employee ID, Username)
   */
  async login(dto: LoginDTO, ipAddress?: string, userAgent?: string): Promise<AuthSuccessResponse> {
    const { identifier, password } = dto;

    if (!identifier || !password) {
      throw new Error('Identifier and password are required');
    }

    // 1. Detect Identifier Type
    const detectedType = detectIdentifierType(identifier);

    // 2. Query Repository with detected type
    const user = await userRepository.findByIdentifier(identifier, detectedType);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 3. Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // 4. Generate Access & Refresh Tokens
    const { accessToken, refreshToken } = await this.generateTokenPair(user, ipAddress, userAgent);

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
      },
      detectedIdentifierType: detectedType,
    };
  }

  /**
   * Register a new user
   */
  async signup(dto: SignupDTO, ipAddress?: string, userAgent?: string): Promise<AuthSuccessResponse> {
    const { fullName, email, username, password, role = 'STUDENT', studentId, employeeId } = dto;

    if (!email || !username || !password || !fullName) {
      throw new Error('Full name, email, username, and password are required');
    }

    // Check existing
    const existing = await userRepository.findByEmailOrUsername(email, username);
    if (existing) {
      throw new Error('User with this email or username already exists');
    }

    // Hash Password
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: `usr-${Date.now()}`,
      fullName,
      email,
      username,
      studentId: studentId || (email.toLowerCase().includes('student') ? `STU${Math.floor(10000 + Math.random() * 90000)}` : undefined),
      employeeId: employeeId || (email.toLowerCase().includes('emp') ? `EMP${Math.floor(100 + Math.random() * 900)}` : undefined),
      role,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    const created = await userRepository.createUser(newUser);
    const detectedType = detectIdentifierType(email);

    const { accessToken, refreshToken } = await this.generateTokenPair(created, ipAddress, userAgent);

    const { passwordHash: _, ...userWithoutPassword } = created;

    return {
      user: userWithoutPassword,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
      },
      detectedIdentifierType: detectedType,
    };
  }

  /**
   * Rotate Refresh Token & Issue new Access/Refresh pair
   * Includes strict replay attack detection
   */
  async refreshTokens(
    refreshTokenStr: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    if (!refreshTokenStr) {
      throw new Error('Refresh token is required');
    }

    let payload: RefreshTokenPayload;
    try {
      payload = jwt.verify(refreshTokenStr, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
    } catch {
      throw new Error('Invalid or expired refresh token');
    }

    if (payload.tokenType !== 'refresh' || !payload.tokenId) {
      throw new Error('Invalid refresh token payload');
    }

    // Check token record in revocation repository
    const tokenRecord = await tokenRepository.findTokenById(payload.tokenId);
    if (!tokenRecord) {
      throw new Error('Refresh token not found');
    }

    // REPLAY ATTACK DETECTION
    if (tokenRecord.isRevoked) {
      // Replay attack detected! Revoke all tokens for this user for security
      await tokenRepository.revokeAllUserTokens(tokenRecord.userId);
      throw new Error('Security alert: Revoked refresh token reused. Session invalidated.');
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw new Error('User no longer exists');
    }

    // Generate new token pair
    const newTokenId = `tok-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    // Revoke old token and mark replacedBy
    await tokenRepository.revokeToken(tokenRecord.id, newTokenId);

    // Issue new pair
    const { accessToken, refreshToken } = await this.generateTokenPair(user, ipAddress, userAgent, newTokenId);

    return {
      accessToken,
      refreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
    };
  }

  /**
   * Revoke session on logout
   */
  async logout(refreshTokenStr: string): Promise<void> {
    if (!refreshTokenStr) return;
    try {
      const payload = jwt.verify(refreshTokenStr, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
      if (payload?.tokenId) {
        await tokenRepository.revokeToken(payload.tokenId);
      }
    } catch {
      // Ignore token decode errors on logout
    }
  }

  /**
   * Private helper to issue tokens
   */
  private async generateTokenPair(
    user: User,
    ipAddress?: string,
    userAgent?: string,
    forcedTokenId?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessPayload: AccessTokenPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
      username: user.username,
      tokenType: 'access',
    };

    const accessToken = jwt.sign(accessPayload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const tokenId = forcedTokenId || `tok-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const refreshPayload: RefreshTokenPayload = {
      userId: user.id,
      tokenId,
      tokenType: 'refresh',
    };

    const refreshToken = jwt.sign(refreshPayload, REFRESH_TOKEN_SECRET, {
      expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d`,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    const tokenRecord: RefreshTokenRecord = {
      id: tokenId,
      userId: user.id,
      token: refreshToken,
      isRevoked: false,
      expiresAt,
      createdAt: new Date(),
      ipAddress,
      userAgent,
    };

    await tokenRepository.saveRefreshToken(tokenRecord);

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
