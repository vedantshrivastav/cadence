import { Platform } from 'react-native';

/**
 * Backend URL.
 * - Android emulator reaches your PC's localhost at 10.0.2.2
 * - A real phone needs your PC's Wi-Fi IP, e.g. http://192.168.1.10:4000/api (same network)
 * - Production: your deployed backend URL (https)
 */
const DEV_API_URL = Platform.select({
  android: 'http://10.0.2.2:4000/api',
  default: 'http://localhost:4000/api',
});

const PROD_API_URL = 'https://api.cadence.example.com/api'; // TODO: replace after deploying the backend

export const config = {
  apiUrl: __DEV__ ? DEV_API_URL : PROD_API_URL,
} as const;
