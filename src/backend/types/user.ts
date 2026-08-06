import { UserRole } from './auth';

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  emailNotifications?: boolean;
  twoFactorEnabled?: boolean;
  language?: string;
  displayMode?: 'compact' | 'comfortable';
}

export interface EditProfileDTO {
  fullName?: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  preferences?: UserPreferences;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountDTO {
  password: string;
}

export interface UpdateRoleDTO {
  role: UserRole;
}

export interface UserAuditLog {
  id: string;
  userId: string;
  action: 'PROFILE_UPDATE' | 'PASSWORD_CHANGE' | 'ROLE_CHANGE' | 'ACCOUNT_DELETE' | 'AVATAR_UPDATE' | 'PREFERENCES_UPDATE';
  performedBy: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp: string;
}
