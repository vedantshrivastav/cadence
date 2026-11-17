import { createContext, use, useCallback, useEffect, useState, type PropsWithChildren } from 'react';

import { setAuthToken, setUnauthorizedHandler } from '@/lib/api';
import { tokenStorage } from '@/lib/storage';
import { authService } from '@/services/auth';
import type { AuthResponse, Subscription, User } from '@/types/api';

interface SessionValue {
  /** True while the saved token is being checked on app start (splash screen stays up). */
  isLoading: boolean;
  user: User | null;
  subscriptions: Subscription[];
  isSignedIn: boolean;
  needsPhoneVerification: boolean;
  isAdmin: boolean;
  /** Call with the backend's response after Google sign-in. */
  signIn: (res: AuthResponse) => Promise<void>;
  /** Call after phone OTP verification / profile edits / payments to refresh user + subscriptions. */
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function useSession() {
  const value = use(SessionContext);
  if (!value) throw new Error('useSession must be used inside <SessionProvider>');
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    setSubscriptions([]);
    await tokenStorage.clear();
    // TODO: also sign out of Google + Firebase once those SDKs are added.
  }, []);

  const refresh = useCallback(async () => {
    const me = await authService.me();
    setUser(me.user);
    setSubscriptions(me.subscriptions);
  }, []);

  // Restore session on app start.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      signOut();
    });
    (async () => {
      try {
        const token = await tokenStorage.get();
        if (token) {
          setAuthToken(token);
          await refresh();
        }
      } catch {
        await signOut();
      } finally {
        setIsLoading(false);
      }
    })();
    return () => setUnauthorizedHandler(null);
  }, [refresh, signOut]);

  const signIn = useCallback(async (res: AuthResponse) => {
    setAuthToken(res.token);
    await tokenStorage.set(res.token);
    setUser(res.user);
    setSubscriptions(res.subscriptions);
  }, []);

  const value: SessionValue = {
    isLoading,
    user,
    subscriptions,
    isSignedIn: user !== null,
    needsPhoneVerification: user?.role === 'student' && !user.phoneVerified,
    isAdmin: user?.role === 'admin',
    signIn,
    refresh,
    signOut,
  };

  return <SessionContext value={value}>{children}</SessionContext>;
}
