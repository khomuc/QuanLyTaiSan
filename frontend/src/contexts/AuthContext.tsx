import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser } from '../lib/types';
import { api, clearStoredToken, getStoredToken, setStoredToken } from '../lib/api';
import * as demo from '../lib/mockData';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  apiMode: 'api' | 'demo';
  loading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [apiMode, setApiMode] = useState<'api' | 'demo'>('api');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (token === 'demo-token') {
      setUser(demo.demoUser);
      setApiMode('demo');
      setLoading(false);
      return;
    }

    api
      .me()
      .then((profile) => {
        setUser(profile);
        setApiMode('api');
      })
      .catch(() => {
        clearStoredToken();
        setToken(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const login = (newToken: string, newUser: AuthUser) => {
    setStoredToken(newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  };

  const refresh = async () => {
    if (!token) return;
    try {
      const profile = await api.me();
      setUser(profile);
      setApiMode('api');
    } catch {
      clearStoredToken();
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        apiMode,
        loading,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
