import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api, clearStoredToken, getStoredToken, setStoredToken } from '../lib/api';
import * as demo from '../lib/mockData';
import type { AuthUser, LoginResult } from '../lib/types';

interface AuthContextType {
  apiMode: 'api' | 'demo';
  initialized: boolean;
  loading: boolean;
  loginSuccess: (result: LoginResult) => void;
  logout: () => void;
  reloadProfile: () => Promise<void>;
  token: string | null;
  user: AuthUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [apiMode, setApiMode] = useState<'api' | 'demo'>('api');
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    if (token === 'demo-token') {
      setUser(demo.demoUser);
      setApiMode('demo');
      setLoading(false);
      setInitialized(true);
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
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
        setInitialized(true);
      });
  }, [token]);

  function loginSuccess(result: LoginResult) {
    setStoredToken(result.accessToken);
    setToken(result.accessToken);
    setUser(result.user);
    setApiMode(result.accessToken === 'demo-token' ? 'demo' : 'api');
  }

  function logout() {
    clearStoredToken();
    setToken(null);
    setUser(null);
    setApiMode('api');
  }

  async function reloadProfile() {
    if (!token || token === 'demo-token') {
      setUser(demo.demoUser);
      setApiMode('demo');
      return;
    }

    try {
      setUser(await api.me());
      setApiMode('api');
    } catch {
      setApiMode('demo');
    }
  }

  return (
    <AuthContext.Provider
      value={{
        apiMode,
        initialized,
        loading,
        loginSuccess,
        logout,
        reloadProfile,
        token,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
