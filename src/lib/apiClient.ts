import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: 'STUDENT' | 'EMPLOYEE' | 'ADMIN';
  studentId?: string;
  employeeId?: string;
  createdAt: string;
}

const TOKEN_KEY = 'jwt_auth_tokens';
const USER_KEY = 'jwt_auth_user';

// Token & User Local Storage Helpers
export const TokenStorage = {
  getTokens(): AuthTokens | null {
    try {
      const saved = localStorage.getItem(TOKEN_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  },

  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  setUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  clearAll(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// Create main Axios instance
export const apiClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Queue for failed requests during ongoing token refresh
interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

let onLogoutCallback: (() => void) | null = null;

export const registerAuthLogoutHandler = (callback: () => void) => {
  onLogoutCallback = callback;
};

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Bearer Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const tokens = TokenStorage.getTokens();
    if (tokens?.accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Automatic Refresh Token Handling & Queueing
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Ignore 401 errors from authentication endpoints to avoid loops
    const isAuthEndpoint =
      originalRequest?.url?.includes('/api/auth/login') ||
      originalRequest?.url?.includes('/api/auth/signup') ||
      originalRequest?.url?.includes('/api/auth/refresh') ||
      originalRequest?.url?.includes('/api/auth/logout');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue pending requests while token refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentTokens = TokenStorage.getTokens();

      if (!currentTokens?.refreshToken || currentTokens.refreshToken.startsWith('demo_') || currentTokens.refreshToken.startsWith('local_')) {
        isRefreshing = false;
        TokenStorage.clearAll();
        if (onLogoutCallback) onLogoutCallback();
        return Promise.reject(error);
      }

      try {
        // Call refresh endpoint with current refreshToken
        const refreshResponse = await axios.post('/api/auth/refresh', {
          refreshToken: currentTokens.refreshToken,
        });

        const data = refreshResponse.data?.data;
        if (!data || !data.accessToken) {
          throw new Error('Invalid refresh response payload');
        }

        const newTokens: AuthTokens = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        };

        TokenStorage.setTokens(newTokens);
        processQueue(null, newTokens.accessToken);

        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        TokenStorage.clearAll();
        if (onLogoutCallback) onLogoutCallback();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
