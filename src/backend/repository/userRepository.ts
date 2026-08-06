import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { IdentifierType, User, UserRole } from '../types/auth';
import { Role } from '@prisma/client';

class UserRepository {
  private inMemoryFallbackUsers: Map<string, User> = new Map();

  constructor() {
    this.initDefaultUsers();
  }

  private async initDefaultUsers() {
    try {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      const demoPasswordHash = await bcrypt.hash('1234', 10);

      const demoUsers: User[] = [
        {
          id: 'usr-smsmoe006',
          email: 'smsmoe006@enterprise.io',
          username: 'SMSMOE006',
          studentId: 'STU006',
          employeeId: 'EMP006',
          fullName: 'SMSMOE006 (Demo Lead)',
          role: 'ADMIN',
          passwordHash: demoPasswordHash,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'usr-1',
          email: 'architect@enterprise.io',
          username: 'architect99',
          studentId: 'STU98765',
          employeeId: 'EMP102',
          fullName: 'Alex Architect (Multi-Id Lead)',
          role: 'ADMIN',
          passwordHash,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'usr-2',
          email: 'student@university.edu',
          username: 'jordan_student',
          studentId: 'STU54321',
          fullName: 'Jordan Miller (Graduate Student)',
          role: 'STUDENT',
          passwordHash,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'usr-3',
          email: 'employee@company.com',
          username: 'taylor_dev',
          employeeId: 'EMP808',
          fullName: 'Taylor Vance (Senior Engineer)',
          role: 'EMPLOYEE',
          passwordHash,
          createdAt: new Date().toISOString(),
        },
      ];

      for (const u of demoUsers) {
        this.inMemoryFallbackUsers.set(u.id, u);
      }

      // Try seeding Prisma PostgreSQL DB
      for (const user of demoUsers) {
        await prisma.user.upsert({
          where: { id: user.id },
          update: {
            email: user.email,
            username: user.username,
            studentId: user.studentId,
            employeeId: user.employeeId,
            fullName: user.fullName,
            role: user.role as Role,
            passwordHash: user.passwordHash,
          },
          create: {
            id: user.id,
            email: user.email,
            username: user.username,
            studentId: user.studentId,
            employeeId: user.employeeId,
            fullName: user.fullName,
            role: user.role as Role,
            passwordHash: user.passwordHash,
            createdAt: new Date(user.createdAt),
          },
        });
      }
    } catch (err) {
      console.warn('PostgreSQL database connection offline for UserRepository seeding. Operating with in-memory fallback.');
    }
  }

  /**
   * Find user by specific identifier based on detected type in PostgreSQL
   */
  async findByIdentifier(identifier: string, type: IdentifierType): Promise<User | null> {
    const cleanId = identifier.trim();

    try {
      let dbUser = null;

      switch (type) {
        case 'EMAIL':
          dbUser = await prisma.user.findFirst({
            where: { email: { equals: cleanId, mode: 'insensitive' } },
          });
          break;
        case 'STUDENT_ID':
          dbUser = await prisma.user.findFirst({
            where: { studentId: { equals: cleanId, mode: 'insensitive' } },
          });
          break;
        case 'EMPLOYEE_ID':
          dbUser = await prisma.user.findFirst({
            where: { employeeId: { equals: cleanId, mode: 'insensitive' } },
          });
          break;
        case 'USERNAME':
          dbUser = await prisma.user.findFirst({
            where: { username: { equals: cleanId, mode: 'insensitive' } },
          });
          break;
      }

      if (!dbUser) {
        // Fallback secondary search across all identifier fields
        dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: cleanId, mode: 'insensitive' } },
              { username: { equals: cleanId, mode: 'insensitive' } },
              { studentId: { equals: cleanId, mode: 'insensitive' } },
              { employeeId: { equals: cleanId, mode: 'insensitive' } },
            ],
          },
        });
      }

      if (dbUser) {
        return this.mapPrismaUserToAuthUser(dbUser);
      }
    } catch (err) {
      // Fall through to in-memory store if DB query encounters issue
    }

    // In-memory fallback
    const lowerCleanId = cleanId.toLowerCase();
    for (const user of this.inMemoryFallbackUsers.values()) {
      if (
        (type === 'EMAIL' && user.email.toLowerCase() === lowerCleanId) ||
        (type === 'STUDENT_ID' && user.studentId?.toLowerCase() === lowerCleanId) ||
        (type === 'EMPLOYEE_ID' && user.employeeId?.toLowerCase() === lowerCleanId) ||
        (type === 'USERNAME' && user.username.toLowerCase() === lowerCleanId) ||
        user.email.toLowerCase() === lowerCleanId ||
        user.username.toLowerCase() === lowerCleanId ||
        user.studentId?.toLowerCase() === lowerCleanId ||
        user.employeeId?.toLowerCase() === lowerCleanId
      ) {
        return { ...user };
      }
    }

    return null;
  }

  async findById(userId: string): Promise<User | null> {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (dbUser) {
        return this.mapPrismaUserToAuthUser(dbUser);
      }
    } catch (err) {
      // Fall through
    }

    const user = this.inMemoryFallbackUsers.get(userId);
    return user ? { ...user } : null;
  }

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    const cleanEmail = email.trim();
    const cleanUsername = username.trim();

    try {
      const dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: cleanEmail, mode: 'insensitive' } },
            { username: { equals: cleanUsername, mode: 'insensitive' } },
          ],
        },
      });

      if (dbUser) {
        return this.mapPrismaUserToAuthUser(dbUser);
      }
    } catch (err) {
      // Fall through
    }

    for (const user of this.inMemoryFallbackUsers.values()) {
      if (
        user.email.toLowerCase() === cleanEmail.toLowerCase() ||
        user.username.toLowerCase() === cleanUsername.toLowerCase()
      ) {
        return { ...user };
      }
    }

    return null;
  }

  async createUser(user: User): Promise<User> {
    this.inMemoryFallbackUsers.set(user.id, { ...user });

    try {
      const created = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          studentId: user.studentId,
          employeeId: user.employeeId,
          fullName: user.fullName,
          role: user.role as Role,
          passwordHash: user.passwordHash,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        },
      });

      return this.mapPrismaUserToAuthUser(created);
    } catch (err) {
      console.warn('PostgreSQL write bypassed, stored in memory cache:', err);
      return { ...user };
    }
  }

  async getAllUsers(): Promise<Omit<User, 'passwordHash'>[]> {
    try {
      const users = await prisma.user.findMany();
      if (users.length > 0) {
        return users.map((u) => {
          const mapped = this.mapPrismaUserToAuthUser(u);
          const { passwordHash, ...rest } = mapped;
          return rest;
        });
      }
    } catch (err) {
      // Fall through
    }

    return Array.from(this.inMemoryFallbackUsers.values()).map(({ passwordHash, ...rest }) => rest);
  }

  private mapPrismaUserToAuthUser(u: any): User {
    return {
      id: u.id,
      email: u.email,
      username: u.username,
      studentId: u.studentId || undefined,
      employeeId: u.employeeId || undefined,
      fullName: u.fullName,
      role: u.role as UserRole,
      passwordHash: u.passwordHash,
      createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : String(u.createdAt),
    };
  }
}

export const userRepository = new UserRepository();
