import bcrypt from 'bcryptjs';
import { userRepository } from '../repository/userRepository';
import { tokenRepository } from '../repository/tokenRepository';
import { auditService } from './auditService';
import { AppError } from '../middleware/errorHandler';
import { User, UserRole } from '../types/auth';
import { EditProfileDTO, ChangePasswordDTO, DeleteAccountDTO, UserPreferences } from '../types/user';

export class UserService {
  /**
   * Get complete user profile
   */
  async getUserProfile(userId: string): Promise<{ user: Omit<User, 'passwordHash'>; parsedPreferences: UserPreferences }> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User profile not found', 404);
    }

    const { passwordHash, ...userWithoutPassword } = user;

    let parsedPreferences: UserPreferences = {
      theme: 'system',
      emailNotifications: true,
      twoFactorEnabled: false,
      language: 'en',
      displayMode: 'comfortable',
    };

    if (user.preferences) {
      try {
        parsedPreferences = { ...parsedPreferences, ...JSON.parse(user.preferences) };
      } catch (e) {
        // Fallback to defaults if parse error
      }
    }

    return {
      user: userWithoutPassword,
      parsedPreferences,
    };
  }

  /**
   * Update user profile (fullName, username, email, avatarUrl, bio, preferences)
   */
  async updateUserProfile(
    userId: string,
    dto: EditProfileDTO,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ user: Omit<User, 'passwordHash'>; parsedPreferences: UserPreferences }> {
    const currentUser = await userRepository.findById(userId);
    if (!currentUser) {
      throw new AppError('User account not found', 404);
    }

    // Check username or email uniqueness if changing
    if (dto.username && dto.username.toLowerCase() !== currentUser.username.toLowerCase()) {
      const existingUser = await userRepository.findByEmailOrUsername('__none__', dto.username);
      if (existingUser && existingUser.id !== userId) {
        throw new AppError('Username is already taken by another user', 400);
      }
    }

    if (dto.email && dto.email.toLowerCase() !== currentUser.email.toLowerCase()) {
      const existingUser = await userRepository.findByEmailOrUsername(dto.email, '__none__');
      if (existingUser && existingUser.id !== userId) {
        throw new AppError('Email address is already registered to another account', 400);
      }
    }

    // Handle preferences serialization
    let updatedPreferencesStr = currentUser.preferences || '{}';
    let mergedPreferences: UserPreferences = {};

    if (currentUser.preferences) {
      try {
        mergedPreferences = JSON.parse(currentUser.preferences);
      } catch (e) {
        mergedPreferences = {};
      }
    }

    if (dto.preferences) {
      mergedPreferences = { ...mergedPreferences, ...dto.preferences };
      updatedPreferencesStr = JSON.stringify(mergedPreferences);
    }

    const updatedUser = await userRepository.updateUser(userId, {
      fullName: dto.fullName !== undefined ? dto.fullName : currentUser.fullName,
      username: dto.username !== undefined ? dto.username : currentUser.username,
      email: dto.email !== undefined ? dto.email : currentUser.email,
      avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : currentUser.avatarUrl,
      bio: dto.bio !== undefined ? dto.bio : currentUser.bio,
      preferences: updatedPreferencesStr,
    });

    auditService.logAction(
      userId,
      dto.preferences && !dto.fullName && !dto.username ? 'PREFERENCES_UPDATE' : 'PROFILE_UPDATE',
      userId,
      { updatedFields: Object.keys(dto) },
      ipAddress,
      userAgent
    );

    const { passwordHash, ...userWithoutPassword } = updatedUser;

    return {
      user: userWithoutPassword,
      parsedPreferences: mergedPreferences,
    };
  }

  /**
   * Change user password with current password verification
   */
  async changePassword(
    userId: string,
    dto: ChangePasswordDTO,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User account not found', 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Current password provided is incorrect', 400);
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);

    // Update password in DB
    await userRepository.updatePassword(userId, newPasswordHash);

    // Revoke all existing sessions for safety
    await tokenRepository.revokeAllUserTokens(userId);

    auditService.logAction(userId, 'PASSWORD_CHANGE', userId, { event: 'Password changed successfully' }, ipAddress, userAgent);
  }

  /**
   * Delete user account with password confirmation
   */
  async deleteAccount(
    userId: string,
    dto: DeleteAccountDTO,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User account not found', 404);
    }

    // Verify password confirmation
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Incorrect password provided. Account deletion canceled.', 400);
    }

    // Revoke tokens
    await tokenRepository.revokeAllUserTokens(userId);

    // Delete user from repository
    await userRepository.deleteUser(userId);

    auditService.logAction(userId, 'ACCOUNT_DELETE', userId, { email: user.email }, ipAddress, userAgent);
  }

  /**
   * Admin: List all registered users
   */
  async getAllUsers(): Promise<Omit<User, 'passwordHash'>[]> {
    return userRepository.getAllUsers();
  }

  /**
   * Admin: Update user role
   */
  async updateUserRole(
    adminUserId: string,
    targetUserId: string,
    newRole: UserRole,
    ipAddress?: string,
    userAgent?: string
  ): Promise<Omit<User, 'passwordHash'>> {
    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new AppError(`Target user with ID '${targetUserId}' not found`, 404);
    }

    if (adminUserId === targetUserId && newRole !== 'ADMIN') {
      throw new AppError('Admins cannot downgrade their own admin role', 400);
    }

    const updatedUser = await userRepository.updateRole(targetUserId, newRole);

    auditService.logAction(
      targetUserId,
      'ROLE_CHANGE',
      adminUserId,
      { previousRole: targetUser.role, newRole },
      ipAddress,
      userAgent
    );

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Admin: Delete user
   */
  async adminDeleteUser(
    adminUserId: string,
    targetUserId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new AppError(`User with ID '${targetUserId}' not found`, 404);
    }

    if (adminUserId === targetUserId) {
      throw new AppError('Admins cannot delete their own account via admin management endpoint', 400);
    }

    await tokenRepository.revokeAllUserTokens(targetUserId);
    await userRepository.deleteUser(targetUserId);

    auditService.logAction(
      targetUserId,
      'ACCOUNT_DELETE',
      adminUserId,
      { deletedByAdmin: true, targetEmail: targetUser.email },
      ipAddress,
      userAgent
    );
  }
}

export const userService = new UserService();
