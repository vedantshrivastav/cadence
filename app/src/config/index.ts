import { Platform } from 'react-native';

/**
 * Backend URL.
 * - Android emulator reaches your PC's localhost at 10.0.2.2
 * - A real phone needs your PC's Wi-Fi IP, e.g. http://192.168.1.10:4000/api (same network)
 * - Production: your deployed backend URL (https)
 */
const DEV_API_URL = Platform.select({
  android: 'http://localhost:4000/api',
  default: 'http://localhost:4000/api',
});

const PROD_API_URL = 'https://api.cadence.example.com/api'; // TODO: replace after deploying the backend

export const config = {
  apiUrl: __DEV__ ? DEV_API_URL : PROD_API_URL,

  /**
   * Google Sign-In "Web client" OAuth ID (Google Cloud Console → Credentials, or Firebase → Authentication →
   * Google → Web SDK configuration). The backend's GOOGLE_CLIENT_IDS must include this same ID.
   */
  googleWebClientId: 'REPLACE_ME.apps.googleusercontent.com',

  /** Shown on Profile → Help. TODO: replace with the academy's real contact details. */
  academy: {
    name: 'Cadence Music Academy',
    phone: '919000000000', // country code + number, digits only (used for WhatsApp and calls)
    email: 'hello@cadence.example.com',
  },
} as const;
