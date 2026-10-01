'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api';
import type { User } from '@/lib/types';
import { Spinner } from './ui';

const AuthContext = createContext<User | null>(null);

/** Current signed in user. Available to every screen inside the portal. */
export const useAuth = () => useContext(AuthContext);

/**
 * Gate for every screen inside the portal.
 *
 * The Express API is the real security boundary - it verifies the httpOnly
 * cookie on every request - so this component only decides what the browser
 * shows: a spinner while the session is checked, the login screen when the
 * cookie is missing or expired, and the app once the user is known.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'checking' | 'in' | 'out'>('checking');

  useEffect(() => {
    let cancelled = false;

    apiGet<{ data: { user: User } }>('/auth/me')
      .then((payload) => {
        if (cancelled) return;
        setUser(payload.data.user);
        setStatus('in');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('out');
        router.replace('/login');
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status !== 'in' || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ink-50 text-sm text-ink-500">
        <Spinner className="size-6" />
        {status === 'out' ? 'Redirecting to login…' : 'Checking your session…'}
      </div>
    );
  }

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
