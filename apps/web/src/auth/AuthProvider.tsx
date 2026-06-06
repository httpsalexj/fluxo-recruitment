import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { DiscordUser } from '../types';
import { apiFetch } from '../api/client';

type AuthContextValue = {
  user: DiscordUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const data = await apiFetch<{ user: DiscordUser | null }>('/api/auth/me');
    setUser(data.user);
  }

  async function logout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({ user, loading, refresh, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro do AuthProvider.');
  return context;
}
