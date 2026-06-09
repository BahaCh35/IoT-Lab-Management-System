import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/api/authService';
import { UserProfile } from '../types';

const USER_KEY = 'auth_user';

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from SecureStore on mount, then refresh from server in background
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await authService.getStoredToken();
        const storedUser = await authService.getStoredUser();
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          // Fire-and-forget: pull the latest profile from the server so any
          // changes made elsewhere (e.g. admin renamed via web/profile screen)
          // are reflected immediately on next render.
          authService
            .getCurrentUser()
            .then(async (fresh) => {
              setUser(fresh);
              await SecureStore.setItemAsync(USER_KEY, JSON.stringify(fresh));
            })
            .catch(() => {
              /* offline or 401 — keep cached user; 401 path is handled in client interceptor */
            });
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const refreshUser = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const fresh = await authService.getCurrentUser();
      setUser(fresh);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(fresh));
      return fresh;
    } catch {
      return null;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedInUser, token: authToken } = await authService.login(
      email,
      password,
    );

    if (loggedInUser.role !== 'admin') {
      // Clean up immediately — don't allow non-admin access
      await authService.logout();
      throw new Error('Access denied. This app is for administrators only.');
    }

    setUser(loggedInUser);
    setToken(authToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
