import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, getStoredToken, setStoredToken, clearStoredToken } from '../lib/api';
import type { AuthUser, LoginResult } from '../lib/types';

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  apiMode: 'api' | 'demo';
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  reloadProfile: () => Promise<void>;
  loginSuccess: (result: LoginResult) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [apiMode, setApiMode] = useState<'api' | 'demo'>('api');

  // Initialize on mount
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    if (token === 'demo-token') {
      const demoUser: AuthUser = {
        maNhanVien: 'DEMO',
        hoTen: 'Demo User',
        maVaiTro: 'ADMIN',
        email: 'demo@example.com',
        tenPhongBan: 'Demo Department',
        maPhongBan: 'DEMO',
        trangThai: 'ACTIVE',
        permissions: ['*'],
      };
      setUser(demoUser);
      setApiMode('demo');
      setInitialized(true);
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
        setInitialized(true);
        setLoading(false);
      });
  }, [token]);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    const result = await api.login(email, password);
    setStoredToken(result.token || result.accessToken || '');
    setToken(result.token || result.accessToken || '');
    setUser(result.user);
    return result;
  };

  const loginSuccess = (result: LoginResult) => {
    setStoredToken(result.token || result.accessToken || '');
    setToken(result.token || result.accessToken || '');
    setUser(result.user);
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  };

  const reloadProfile = async () => {
    try {
      const profile = await api.me();
      setUser(profile);
      setApiMode('api');
    } catch {
      setApiMode('demo');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        initialized,
        apiMode,
        login,
        logout,
        reloadProfile,
        loginSuccess,
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
