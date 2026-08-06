import React, { createContext, useContext, useState, useEffect } from 'react';
import { IdentifierType, User, UserRole } from '../backend/types/auth';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthContextType {
  user: Omit<User, 'passwordHash'> | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastDetectedIdentifierType: IdentifierType | null;
  activeSessionsCount: number;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (data: { fullName: string; email: string; username: string; password: string; role?: UserRole; studentId?: string; employeeId?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  revokeAllSessions: () => Promise<void>;
  detectIdentifier: (input: string) => IdentifierType;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Omit<User, 'passwordHash'> | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(() => {
    const saved = localStorage.getItem('jwt_auth_tokens');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastDetectedIdentifierType, setLastDetectedIdentifierType] = useState<IdentifierType | null>(null);
  const [activeSessionsCount, setActiveSessionsCount] = useState<number>(1);

  // Client-side regex inference detector for interactive UI feedback
  const detectIdentifier = (input: string): IdentifierType => {
    const clean = input.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return 'EMAIL';
    if (/^(STU|S|202[0-9])\d{4,8}$/i.test(clean)) return 'STUDENT_ID';
    if (/^(EMP|E|700)\d{3,8}$/i.test(clean)) return 'EMPLOYEE_ID';
    return 'USERNAME';
  };

  // Check initial token validity and fetch user profile
  useEffect(() => {
    const initAuth = async () => {
      if (tokens?.accessToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${tokens.accessToken}` },
          });

          if (res.ok) {
            const json = await res.json();
            setUser(json.data.user);
            fetchSessions(tokens.accessToken);
          } else {
            // Try refresh
            await refreshTokens();
          }
        } catch {
          // Token invalid, clear state
          setTokens(null);
          localStorage.removeItem('jwt_auth_tokens');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const fetchSessions = async (accessToken: string) => {
    try {
      const res = await fetch('/api/auth/active-sessions', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const json = await res.json();
        setActiveSessionsCount(json.count || 1);
      }
    } catch {
      // Ignore
    }
  };

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Authentication failed');
      }

      setUser(json.data.user);
      setTokens(json.data.tokens);
      setLastDetectedIdentifierType(json.data.detectedIdentifierType);
      localStorage.setItem('jwt_auth_tokens', JSON.stringify(json.data.tokens));
      fetchSessions(json.data.tokens.accessToken);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    role?: UserRole;
    studentId?: string;
    employeeId?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Registration failed');
      }

      setUser(json.data.user);
      setTokens(json.data.tokens);
      setLastDetectedIdentifierType(json.data.detectedIdentifierType);
      localStorage.setItem('jwt_auth_tokens', JSON.stringify(json.data.tokens));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTokens = async () => {
    if (!tokens?.refreshToken) return;

    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Session expired');
      }

      const newTokens = {
        accessToken: json.data.accessToken,
        refreshToken: json.data.refreshToken,
        expiresIn: json.data.expiresIn,
      };

      setTokens(newTokens);
      localStorage.setItem('jwt_auth_tokens', JSON.stringify(newTokens));
    } catch {
      setUser(null);
      setTokens(null);
      localStorage.removeItem('jwt_auth_tokens');
    }
  };

  const logout = async () => {
    if (tokens?.refreshToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });
      } catch {
        // Ignore
      }
    }
    setUser(null);
    setTokens(null);
    localStorage.removeItem('jwt_auth_tokens');
  };

  const revokeAllSessions = async () => {
    if (!tokens?.accessToken) return;
    try {
      await fetch('/api/auth/revoke-all', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.accessToken}` },
      });
      await logout();
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!user,
        isLoading,
        lastDetectedIdentifierType,
        activeSessionsCount,
        login,
        signup,
        logout,
        refreshTokens,
        revokeAllSessions,
        detectIdentifier,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
