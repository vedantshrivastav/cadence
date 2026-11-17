import { OAuth2Client } from "google-auth-library";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

// ---------- Google Sign-In ----------
const googleClient = new OAuth2Client();

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  picture?: string | undefined;
}

/** Verifies the ID token the app gets from @react-native-google-signin/google-signin. */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  try {
    const ticket = await googleClient.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_IDS });
    const p = ticket.getPayload();
    if (!p?.sub || !p.email || !p.email_verified) throw new Error("Email not verified");
    return { googleId: p.sub, email: p.email.toLowerCase(), name: p.name ?? p.email, picture: p.picture };
  } catch {
    throw AppError.unauthorized("Invalid Google sign-in token");
  }
}

// ---------- Firebase Phone Auth (OTP) ----------
const firebaseApp =
  getApps()[0] ??
  initializeApp({
    projectId: env.FIREBASE_PROJECT_ID,
    ...(env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY
      ? {
          credential: cert({
            projectId: env.FIREBASE_PROJECT_ID,
            clientEmail: env.FIREBASE_CLIENT_EMAIL,
            privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          }),
        }
      : {}),
  });

/**
 * The app sends the OTP and confirms it with @react-native-firebase/auth,
 * then sends us the Firebase ID token. Returns the verified phone number in E.164 (+91…).
 */
export async function verifyFirebasePhoneToken(firebaseIdToken: string): Promise<string> {
  let decoded;
  try {
    decoded = await getAuth(firebaseApp).verifyIdToken(firebaseIdToken);
  } catch {
    throw AppError.unauthorized("Invalid or expired OTP verification token");
  }
  if (!decoded.phone_number) throw AppError.badRequest("Token does not contain a verified phone number");
  return decoded.phone_number;
}
