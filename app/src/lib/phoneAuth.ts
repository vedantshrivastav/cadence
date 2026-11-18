import { getApps } from '@react-native-firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signOut,
} from '@react-native-firebase/auth';

/**
 * Firebase Phone Auth is used ONLY to prove the student owns the number.
 * The backend verifies the Firebase ID token and stores the phone; the app's own session stays the backend JWT.
 */

export type Confirmation = Awaited<ReturnType<typeof signInWithPhoneNumber>>;

function auth() {
  if (getApps().length === 0) {
    throw new Error('Firebase is not set up yet: add android/app/google-services.json and rebuild the app.');
  }
  return getAuth();
}

/** Indian mobile numbers only (the backend accepts +91). */
export function isValidIndianMobile(digits: string) {
  return /^[6-9]\d{9}$/.test(digits);
}

/** Sends the OTP SMS. */
export function sendOtp(tenDigitNumber: string): Promise<Confirmation> {
  return signInWithPhoneNumber(auth(), `+91${tenDigitNumber}`).catch(e => {
    throw new Error(friendlyError(e));
  });
}

/** Checks the 6-digit code and returns a Firebase ID token for POST /auth/verify-phone. */
export async function confirmOtp(confirmation: Confirmation, code: string): Promise<string> {
  try {
    const cred = await confirmation.confirm(code);
    const user = cred?.user ?? auth().currentUser;
    if (!user) throw new Error('Verification failed. Please request a new code.');
    return await user.getIdToken(true);
  } catch (e) {
    throw new Error(friendlyError(e));
  }
}

/**
 * Android can read the SMS and verify automatically without the code being typed.
 * Calls `onVerified` with an ID token when that happens.
 */
export function onAutoVerified(onVerified: (idToken: string) => void): () => void {
  if (getApps().length === 0) return () => {};
  return onAuthStateChanged(getAuth(), user => {
    if (user?.phoneNumber) {
      user.getIdToken(true).then(onVerified, () => {});
    }
  });
}

/** Firebase's session isn't needed after the backend has stored the phone. */
export async function firebaseSignOut() {
  if (getApps().length === 0) return;
  await signOut(getAuth()).catch(() => {});
}

function friendlyError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/invalid-phone-number':
      return 'That phone number is not valid.';
    case 'auth/invalid-verification-code':
      return 'Wrong code. Please check the SMS and try again.';
    case 'auth/code-expired':
    case 'auth/session-expired':
      return 'The code has expired. Please request a new one.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a while and try again.';
    case 'auth/quota-exceeded':
      return 'SMS limit reached for today. Please try again later.';
    case 'auth/network-request-failed':
      return 'No internet connection.';
    case 'auth/app-not-authorized':
    case 'auth/missing-client-identifier':
      return 'Phone sign-in is misconfigured: add this app’s SHA-1 and SHA-256 in Firebase.';
  }
  return e instanceof Error ? e.message : 'Something went wrong. Please try again.';
}
