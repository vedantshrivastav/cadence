import { api } from '@/lib/api';
import type { AuthResponse, Instrument, Subscription, User } from '@/types/api';

export const authService = {
  /** idToken from Google Sign-In on the device. */
  googleLogin: (idToken: string) => api.post<AuthResponse>('/auth/google', { idToken }),

  /** firebaseIdToken from Firebase Phone Auth after the OTP is confirmed. */
  verifyPhone: (firebaseIdToken: string) =>
    api.post<{ user: User; linkedSubscriptions: number; subscriptions: Subscription[] }>(
      '/auth/verify-phone',
      { firebaseIdToken },
    ),

  /** DEVELOPMENT ONLY — backend must have DEV_LOGIN_ENABLED=true. */
  devLogin: (persona: 'student' | 'admin' | 'unverified') =>
    api.post<AuthResponse>('/auth/dev-login', { persona }),

  me: () =>
    api.get<{ user: User; needsPhoneVerification: boolean; subscriptions: Subscription[] }>('/auth/me'),

  updateProfile: (body: { name?: string; instruments?: Instrument[]; pushToken?: string }) =>
    api.patch<{ user: User }>('/auth/me', body),
};
