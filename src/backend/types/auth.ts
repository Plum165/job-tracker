export type IdentifierType = 'EMAIL' | 'STUDENT_ID' | 'EMPLOYEE_ID' | 'USERNAME';

export type UserRole = 'STUDENT' | 'EMPLOYEE' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  username: string;
  studentId?: string;
  employeeId?: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  preferences?: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AccessTokenPayload {
  userId: string;
  role: UserRole;
  email: string;
  username: string;
  tokenType: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  tokenType: 'refresh';
}

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  token: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  replacedByTokenId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginDTO {
  identifier: string; // Accepts email, student ID, employee ID, or username
  password: string;
}

export interface SignupDTO {
  fullName: string;
  email: string;
  username: string;
  password: string;
  role?: UserRole;
  studentId?: string;
  employeeId?: string;
}

export interface AuthSuccessResponse {
  user: Omit<User, 'passwordHash'>;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // seconds
  };
  detectedIdentifierType: IdentifierType;
}
