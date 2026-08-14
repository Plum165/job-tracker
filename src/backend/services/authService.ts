import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { detectIdentifierType } from '../utils/identifierDetector';
import { userRepository } from '../repository/userRepository';
import { tokenRepository } from '../repository/tokenRepository';
import { envConfig } from '../config/envConfig';
import { AppError } from '../middleware/errorHandler';
import {
  AccessTokenPayload,
  AuthSuccessResponse,
  LoginDTO,
  RefreshTokenPayload,
  RefreshTokenRecord,
  SignupDTO,
  User,
} from '../types/auth';

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
      throw new AppError('Identifier and password are required', 400);
    }

    if (typeof password !== 'string' || password.trim().length === 0) {
      throw new AppError('Password is required', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    // 1. Detect Identifier Type
    const detectedType = detectIdentifierType(identifier);

    // 2. Query Repository with detected type
    const user = await userRepository.findByIdentifier(identifier, detectedType);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // 3. Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
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
    const { fullName, email, username, password, confirmPassword, role = 'STUDENT', studentId, employeeId } = dto;

    if (!email || !username || !password || !fullName) {
      throw new AppError('Full name, email, username, and password are required', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }

    if (confirmPassword !== undefined && confirmPassword !== password) {
      throw new AppError('Passwords do not match', 400);
    }

    // Check existing user
    let existing: any = null;
    try {
      existing = await userRepository.findByEmailOrUsername(email, username);
    } catch (err) {
      console.error('Error checking existing user:', err);
      throw new AppError('Database error while checking user availability', 500);
    }

    if (existing) {
      throw new AppError(`User with email "${email}" or username "${username}" already exists`, 409);
    }

    // Hash password
    let passwordHash: string;
    try {
      passwordHash = await bcrypt.hash(password, 10);
    } catch (err) {
      console.error('Error hashing password:', err);
      throw new AppError('Failed to process password', 500);
    }

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      fullName,
      email,
      username,
      studentId: studentId && studentId.trim() ? studentId.trim() : undefined,
      employeeId: employeeId && employeeId.trim() ? employeeId.trim() : undefined,
      role,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    // Create the user
    let created: User;
    try {
      created = await userRepository.createUser(newUser);
    } catch (err) {
      console.error('Error creating user:', err);
      throw new AppError('Failed to create user account', 500);
    }

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
      payload = jwt.verify(refreshTokenStr, envConfig.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Refresh token expired. Please log in again.', 401);
      }
      if (err.name === 'JsonWebTokenError') {
        throw new AppError('Invalid refresh token signature or structure.', 401);
      }
      throw new AppError('Invalid refresh token.', 401);
    }

    if (payload.tokenType !== 'refresh' || !payload.tokenId) {
      throw new AppError('Invalid refresh token payload.', 401);
    }

    // Check token record in revocation repository
    const tokenRecord = await tokenRepository.findTokenById(payload.tokenId);
    if (!tokenRecord) {
      throw new AppError('Refresh token session not found or revoked.', 401);
    }

    // REPLAY ATTACK DETECTION
    if (tokenRecord.isRevoked) {
      // Replay attack detected! Revoke all tokens for this user for security
      await tokenRepository.revokeAllUserTokens(tokenRecord.userId);
      throw new AppError('Security Alert: Revoked token reuse detected. All active sessions invalidated.', 401, {
        securityEvent: 'REPLAY_ATTACK_DETECTED',
        userId: tokenRecord.userId,
      });
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw new AppError('Associated user account no longer exists.', 401);
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
      const payload = jwt.verify(refreshTokenStr, envConfig.JWT_REFRESH_SECRET) as RefreshTokenPayload;
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

    const accessToken = jwt.sign(accessPayload, envConfig.JWT_ACCESS_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    const tokenId = forcedTokenId || `tok-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const refreshPayload: RefreshTokenPayload = {
      userId: user.id,
      tokenId,
      tokenType: 'refresh',
    };

    const refreshToken = jwt.sign(refreshPayload, envConfig.JWT_REFRESH_SECRET, {
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
