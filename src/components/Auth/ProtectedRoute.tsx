import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthPage } from './AuthPage';
import { UserRole } from '../../backend/types/auth';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  fallback,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Restoring Authenticated Session
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Verifying JWT token validity with enterprise auth service...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : <AuthPage />;
  }

  if (requiredRole && user) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(user.role)) {
      return (
        <div className="p-8 max-w-lg mx-auto my-12 bg-rose-950/30 border border-rose-800/50 rounded-2xl text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 bg-rose-900/50 border border-rose-500 text-rose-300 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-rose-200 uppercase tracking-wide">
              Access Restricted
            </h2>
            <p className="text-xs text-rose-300/80 mt-1">
              Your account role (<span className="font-semibold text-rose-200">{user.role}</span>) does not have permission to view this section.
            </p>
          </div>
          <div className="text-[11px] text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            Required role: <span className="font-mono text-blue-400">{allowedRoles.join(' or ')}</span>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
