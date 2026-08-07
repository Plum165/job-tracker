import { useAuth as useAuthContext } from '../context/AuthContext';
import { UserRole } from '../backend/types/auth';

/**
 * Main hook for accessing authentication state and user context
 */
export const useAuth = useAuthContext;

/**
 * Helper hook to check role permissions
 */
export const useUserRole = () => {
  const { user } = useAuthContext();

  const isStudent = user?.role === 'STUDENT';
  const isEmployee = user?.role === 'EMPLOYEE';
  const isAdmin = user?.role === 'ADMIN';

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false;
    if (Array.isArray(role)) return role.includes(user.role);
    return user.role === role;
  };

  return {
    role: user?.role || null,
    isStudent,
    isEmployee,
    isAdmin,
    hasRole,
  };
};

/**
 * Helper hook requiring authentication
 */
export const useRequireAuth = (requiredRole?: UserRole | UserRole[]) => {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const { hasRole } = useUserRole();

  const isAuthorized = isAuthenticated && (!requiredRole || hasRole(requiredRole));

  return {
    user,
    isAuthenticated,
    isAuthorized,
    isLoading,
  };
};
