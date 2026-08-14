import React, { createContext, useContext, useState, useEffect } from 'react';
import { IdentifierType, User, UserRole } from '../backend/types/auth';
import { apiClient, TokenStorage, AuthTokens, registerAuthLogoutHandler } from '../lib/apiClient';

interface AuthContextType {
  user: Omit<User, 'passwordHash'> | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastDetectedIdentifierType: IdentifierType | null;
  activeSessionsCount: number;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (data: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword?: string;
    role?: UserRole;
    studentId?: string;
    employeeId?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  revokeAllSessions: () => Promise<void>;
  detectIdentifier: (input: string) => IdentifierType;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Omit<User, 'passwordHash'> | null>(() => TokenStorage.getUser());
  const [tokens, setTokens] = useState<AuthTokens | null>(() => TokenStorage.getTokens());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastDetectedIdentifierType, setLastDetectedIdentifierType] = useState<IdentifierType | null>(null);
  const [activeSessionsCount, setActiveSessionsCount] = useState<number>(1);

  // Detector for interactive UI feedback on identity type (Email vs Student ID vs Employee ID vs Username)
  const detectIdentifier = (input: string): IdentifierType => {
    const clean = input.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return 'EMAIL';
    if (/^(STU|S|202[0-9])\d{4,8}$/i.test(clean)) return 'STUDENT_ID';
    if (/^(EMP|E|700)\d{3,8}$/i.test(clean)) return 'EMPLOYEE_ID';
    return 'USERNAME';
  };

  // Register automatic logout trigger when apiClient encounters an unrecoverable refresh error
  useEffect(() => {
    registerAuthLogoutHandler(() => {
      setUser(null);
      setTokens(null);
      TokenStorage.clearAll();
    });
  }, []);

  // On initial mount, verify session and restore user state via /api/auth/me
  useEffect(() => {
    const initAuth = async () => {
      const storedTokens = TokenStorage.getTokens();
      if (storedTokens?.accessToken) {
        if (storedTokens.accessToken.startsWith('demo_') || storedTokens.accessToken.startsWith('local_')) {
          setIsLoading(false);
          return;
        }

        try {
          const res = await apiClient.get('/api/auth/me');
          if (res.data?.data?.user) {
            const fetchedUser = res.data.data.user;
            setUser(fetchedUser);
            TokenStorage.setUser(fetchedUser);
            fetchSessions();
          }
        } catch {
          // If token restoration fails and refresh fails, clear session
          setUser(null);
          setTokens(null);
          TokenStorage.clearAll();
        }
      } else {
        setIsLoading(false);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await apiClient.get('/api/auth/active-sessions');
      if (res.data?.count) {
        setActiveSessionsCount(res.data.count);
      }
    } catch {
      // Non-critical background call
    }
  };

 const login = async (identifier: string, password: string) => {
    setIsLoading(true);

    try {
      const cleanId = identifier.trim();

      if (!cleanId) {
        throw new Error('Email or username is required.');
      }

      if (typeof password !== 'string' || password.trim().length === 0) {
        throw new Error('Password is required.');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const res = await apiClient.post('/api/auth/login', {
        identifier: cleanId,
        password,
      });

      const data = res.data.data;

      if (!data?.user || !data?.tokens) {
        throw new Error('Login succeeded but the server did not return authentication tokens.');
      }

      setUser(data.user);
      setTokens(data.tokens);
      setLastDetectedIdentifierType(data.detectedIdentifierType);

      TokenStorage.setUser(data.user);
      TokenStorage.setTokens(data.tokens);

      await fetchSessions();
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Authentication failed';

      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword?: string;
    role?: UserRole;
    studentId?: string;
    employeeId?: string;
  }) => {
    setIsLoading(true);

    try {
      if (!data.fullName?.trim()) {
        throw new Error('Full name is required.');
      }

      if (!data.email?.trim()) {
        throw new Error('Email is required.');
      }

      if (!data.username?.trim()) {
        throw new Error('Username is required.');
      }

      if (data.password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      if (data.confirmPassword !== undefined && data.confirmPassword !== data.password) {
        throw new Error('Passwords do not match.');
      }

      const res = await apiClient.post('/api/auth/signup', data);

      const resData = res.data.data;

      if (!resData?.user || !resData?.tokens) {
        throw new Error('Signup succeeded but the server did not return authentication tokens.');
      }

      setUser(resData.user);
      setTokens(resData.tokens);
      setLastDetectedIdentifierType(resData.detectedIdentifierType);

      TokenStorage.setUser(resData.user);
      TokenStorage.setTokens(resData.tokens);

      await fetchSessions();
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed';

      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };
  const refreshTokens = async () => {
    const currentTokens = TokenStorage.getTokens();
    if (!currentTokens?.refreshToken) return;
    if (currentTokens.refreshToken.startsWith('demo_') || currentTokens.refreshToken.startsWith('local_')) {
      return;
    }

    try {
      const res = await apiClient.post('/api/auth/refresh', {
        refreshToken: currentTokens.refreshToken,
      });

      const newTokens: AuthTokens = {
        accessToken: res.data.data.accessToken,
        refreshToken: res.data.data.refreshToken,
        expiresIn: res.data.data.expiresIn,
      };

      setTokens(newTokens);
      TokenStorage.setTokens(newTokens);
    } catch {
      setUser(null);
      setTokens(null);
      TokenStorage.clearAll();
    }
  };

  const logout = async () => {
    const currentTokens = TokenStorage.getTokens();
    if (currentTokens?.refreshToken && !currentTokens.refreshToken.startsWith('demo_') && !currentTokens.refreshToken.startsWith('local_')) {
      try {
        await apiClient.post('/api/auth/logout', { refreshToken: currentTokens.refreshToken });
      } catch {
        // Ignore logout network errors
      }
    }
    setUser(null);
    setTokens(null);
    TokenStorage.clearAll();
  };

  const revokeAllSessions = async () => {
    try {
      await apiClient.post('/api/auth/revoke-all');
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
