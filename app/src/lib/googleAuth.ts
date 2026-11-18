import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { config } from '@/config';

/** Thrown when the user backs out of the Google account picker. */
export class GoogleSignInCancelled extends Error {
  constructor() {
    super('Sign-in cancelled');
  }
}

let configured = false;
function ensureConfigured() {
  if (configured) return;
  // webClientId makes Google return an idToken whose audience the backend checks.
  GoogleSignin.configure({ webClientId: config.googleWebClientId });
  configured = true;
}

/** Shows the Google account picker and returns an ID token for POST /auth/google. */
export async function getGoogleIdToken(): Promise<string> {
  if (config.googleWebClientId.startsWith('REPLACE_ME')) {
    throw new Error('Google Sign-In is not set up yet: add googleWebClientId in src/config/index.ts.');
  }
  ensureConfigured();

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Always show the picker, so "use a different account" works after signing out.
    await GoogleSignin.signOut().catch(() => {});
    const res = await GoogleSignin.signIn();
    if (isCancelledResponse(res)) throw new GoogleSignInCancelled();

    const idToken = res.data.idToken ?? (await GoogleSignin.getTokens()).idToken;
    if (!idToken) throw new Error('Google did not return an ID token. Check googleWebClientId.');
    return idToken;
  } catch (e) {
    if (e instanceof GoogleSignInCancelled) throw e;
    if (isErrorWithCode(e)) {
      switch (e.code) {
        case statusCodes.SIGN_IN_CANCELLED:
          throw new GoogleSignInCancelled();
        case statusCodes.IN_PROGRESS:
          throw new Error('Sign-in is already in progress.');
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          throw new Error('Google Play Services is missing or out of date on this phone.');
        case '10': // DEVELOPER_ERROR: SHA-1 / package name / client ID mismatch
          throw new Error(
            'Google Sign-In is misconfigured (DEVELOPER_ERROR). Add this app’s SHA-1 in Firebase and check the web client ID.',
          );
      }
    }
    throw e instanceof Error ? e : new Error('Google sign-in failed');
  }
}

export async function googleSignOut() {
  if (!configured) return;
  await GoogleSignin.signOut().catch(() => {});
}
