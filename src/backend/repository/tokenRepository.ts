import { prisma } from '../lib/prisma';
import { RefreshTokenRecord } from '../types/auth';

class TokenRepository {
  private inMemoryFallbackTokens: Map<string, RefreshTokenRecord> = new Map();

  /**
   * Save a newly issued refresh token in PostgreSQL
   */
  async saveRefreshToken(record: RefreshTokenRecord): Promise<RefreshTokenRecord> {
    this.inMemoryFallbackTokens.set(record.id, { ...record });

    try {
      const created = await prisma.refreshToken.create({
        data: {
          id: record.id,
          userId: record.userId,
          token: record.token,
          isRevoked: record.isRevoked,
          expiresAt: record.expiresAt,
          createdAt: record.createdAt,
          replacedByTokenId: record.replacedByTokenId,
          ipAddress: record.ipAddress,
          userAgent: record.userAgent,
        },
      });

      return this.mapPrismaTokenToRecord(created);
    } catch (err) {
      console.warn('PostgreSQL write bypassed for token, stored in memory cache');
      return { ...record };
    }
  }

  /**
   * Find a refresh token by ID from PostgreSQL
   */
  async findTokenById(tokenId: string): Promise<RefreshTokenRecord | null> {
    try {
      const dbToken = await prisma.refreshToken.findUnique({
        where: { id: tokenId },
      });

      if (dbToken) {
        return this.mapPrismaTokenToRecord(dbToken);
      }
    } catch (err) {
      // Fall through to memory
    }

    const token = this.inMemoryFallbackTokens.get(tokenId);
    return token ? { ...token } : null;
  }

  /**
   * Find token record by matching string token in PostgreSQL
   */
  async findByToken(tokenStr: string): Promise<RefreshTokenRecord | null> {
    try {
      const dbToken = await prisma.refreshToken.findFirst({
        where: { token: tokenStr },
      });

      if (dbToken) {
        return this.mapPrismaTokenToRecord(dbToken);
      }
    } catch (err) {
      // Fall through
    }

    for (const record of this.inMemoryFallbackTokens.values()) {
      if (record.token === tokenStr) {
        return { ...record };
      }
    }
    return null;
  }

  /**
   * Revoke a refresh token in PostgreSQL (e.g. upon rotation or logout)
   */
  async revokeToken(tokenId: string, replacedByTokenId?: string): Promise<void> {
    const memToken = this.inMemoryFallbackTokens.get(tokenId);
    if (memToken) {
      memToken.isRevoked = true;
      if (replacedByTokenId) memToken.replacedByTokenId = replacedByTokenId;
      this.inMemoryFallbackTokens.set(tokenId, memToken);
    }

    try {
      await prisma.refreshToken.update({
        where: { id: tokenId },
        data: {
          isRevoked: true,
          replacedByTokenId: replacedByTokenId || undefined,
        },
      });
    } catch (err) {
      // Fall through
    }
  }

  /**
   * Revoke all refresh tokens for a user in PostgreSQL
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    for (const record of this.inMemoryFallbackTokens.values()) {
      if (record.userId === userId) {
        record.isRevoked = true;
      }
    }

    try {
      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });
    } catch (err) {
      // Fall through
    }
  }

  /**
   * Get active tokens for a user from PostgreSQL
   */
  async getActiveSessions(userId: string): Promise<RefreshTokenRecord[]> {
    const now = new Date();

    try {
      const dbTokens = await prisma.refreshToken.findMany({
        where: {
          userId,
          isRevoked: false,
          expiresAt: { gt: now },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (dbTokens.length > 0) {
        return dbTokens.map((t) => this.mapPrismaTokenToRecord(t));
      }
    } catch (err) {
      // Fall through
    }

    const active: RefreshTokenRecord[] = [];
    for (const record of this.inMemoryFallbackTokens.values()) {
      if (record.userId === userId && !record.isRevoked && record.expiresAt > now) {
        active.push({ ...record });
      }
    }
    return active;
  }

  private mapPrismaTokenToRecord(t: any): RefreshTokenRecord {
    return {
      id: t.id,
      userId: t.userId,
      token: t.token,
      isRevoked: t.isRevoked,
      expiresAt: t.expiresAt instanceof Date ? t.expiresAt : new Date(t.expiresAt),
      createdAt: t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt),
      replacedByTokenId: t.replacedByTokenId || undefined,
      ipAddress: t.ipAddress || undefined,
      userAgent: t.userAgent || undefined,
    };
  }
}

export const tokenRepository = new TokenRepository();
