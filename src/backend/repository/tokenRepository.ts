import { RefreshTokenRecord } from '../types/auth';

class TokenRepository {
  private tokens: Map<string, RefreshTokenRecord> = new Map();

  /**
   * Save a newly issued refresh token
   */
  async saveRefreshToken(record: RefreshTokenRecord): Promise<RefreshTokenRecord> {
    this.tokens.set(record.id, { ...record });
    return record;
  }

  /**
   * Find a refresh token by ID
   */
  async findTokenById(tokenId: string): Promise<RefreshTokenRecord | null> {
    const token = this.tokens.get(tokenId);
    return token ? { ...token } : null;
  }

  /**
   * Find token record by matching string token
   */
  async findByToken(tokenStr: string): Promise<RefreshTokenRecord | null> {
    for (const record of this.tokens.values()) {
      if (record.token === tokenStr) {
        return { ...record };
      }
    }
    return null;
  }

  /**
   * Revoke a refresh token (e.g. upon rotation or logout)
   */
  async revokeToken(tokenId: string, replacedByTokenId?: string): Promise<void> {
    const record = this.tokens.get(tokenId);
    if (record) {
      record.isRevoked = true;
      if (replacedByTokenId) {
        record.replacedByTokenId = replacedByTokenId;
      }
      this.tokens.set(tokenId, record);
    }
  }

  /**
   * Revoke all refresh tokens for a user (Emergency security lockdown / Logout all)
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    for (const record of this.tokens.values()) {
      if (record.userId === userId) {
        record.isRevoked = true;
      }
    }
  }

  /**
   * Get active tokens count for a user
   */
  async getActiveSessions(userId: string): Promise<RefreshTokenRecord[]> {
    const now = new Date();
    const active: RefreshTokenRecord[] = [];
    for (const record of this.tokens.values()) {
      if (record.userId === userId && !record.isRevoked && record.expiresAt > now) {
        active.push({ ...record });
      }
    }
    return active;
  }
}

export const tokenRepository = new TokenRepository();
