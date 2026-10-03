import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Api } from '../api/endpoints';
import { setSessionExpiredHandler, tokens } from '../api/client';
import type { User } from '../types';

type SignUpInput = { email: string; first_name: string; last_name?: string; password: string };

interface AuthState {
  user: User | null; loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (b: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
}
const Ctx = createContext<AuthState>(null as unknown as AuthState);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();

  const signOut = useCallback(async () => {
    await tokens.clear();
    setUser(null);
    qc.removeQueries({ queryKey: ['bookings'] });
    qc.removeQueries({ queryKey: ['booking'] });
  }, [qc]);

  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));
    (async () => {
      try { if (await tokens.get()) setUser(await Api.me()); } catch { /* not signed in */ }
      setLoading(false);
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const t = await Api.login(email, password);
    await tokens.set(t.access, t.refresh);
    setUser(await Api.me());
  }, []);

  const signUp = useCallback(async (b: SignUpInput) => {
    await Api.register(b);
    await signIn(b.email, b.password);
  }, [signIn]);

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut }), [user, loading, signIn, signUp, signOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
