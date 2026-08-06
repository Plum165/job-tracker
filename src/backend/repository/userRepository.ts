import bcrypt from 'bcryptjs';
import { IdentifierType, User } from '../types/auth';

class UserRepository {
  private users: Map<string, User> = new Map();

  constructor() {
    this.seedDefaultUsers();
  }

  private async seedDefaultUsers() {
    const passwordHash = await bcrypt.hash('Password123!', 10);

    const demoUsers: User[] = [
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
      this.users.set(u.id, u);
    }
  }

  /**
   * Find user by specific identifier based on detected type
   */
  async findByIdentifier(identifier: string, type: IdentifierType): Promise<User | null> {
    const cleanId = identifier.trim().toLowerCase();

    for (const user of this.users.values()) {
      switch (type) {
        case 'EMAIL':
          if (user.email.toLowerCase() === cleanId) return { ...user };
          break;
        case 'STUDENT_ID':
          if (user.studentId && user.studentId.toLowerCase() === cleanId) return { ...user };
          break;
        case 'EMPLOYEE_ID':
          if (user.employeeId && user.employeeId.toLowerCase() === cleanId) return { ...user };
          break;
        case 'USERNAME':
          if (user.username.toLowerCase() === cleanId) return { ...user };
          break;
      }
    }

    // Secondary fallback search if strict regex matched student/employee ID format but user didn't have one set, check email or username
    for (const user of this.users.values()) {
      if (
        user.email.toLowerCase() === cleanId ||
        user.username.toLowerCase() === cleanId ||
        (user.studentId && user.studentId.toLowerCase() === cleanId) ||
        (user.employeeId && user.employeeId.toLowerCase() === cleanId)
      ) {
        return { ...user };
      }
    }

    return null;
  }

  async findById(userId: string): Promise<User | null> {
    const user = this.users.get(userId);
    return user ? { ...user } : null;
  }

  async findByEmailOrUsername(email: string, username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (
        user.email.toLowerCase() === email.toLowerCase() ||
        user.username.toLowerCase() === username.toLowerCase()
      ) {
        return { ...user };
      }
    }
    return null;
  }

  async createUser(user: User): Promise<User> {
    this.users.set(user.id, { ...user });
    return { ...user };
  }

  async getAllUsers(): Promise<Omit<User, 'passwordHash'>[]> {
    return Array.from(this.users.values()).map(({ passwordHash, ...rest }) => rest);
  }
}

export const userRepository = new UserRepository();
