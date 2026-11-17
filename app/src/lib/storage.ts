import * as Keychain from 'react-native-keychain';

const SERVICE = 'com.cadenceapp.auth';

/** JWT is kept in the iOS Keychain / Android Keystore, never in plain AsyncStorage. */
export const tokenStorage = {
  async get(): Promise<string | null> {
    const creds = await Keychain.getGenericPassword({ service: SERVICE });
    return creds ? creds.password : null;
  },
  async set(token: string): Promise<void> {
    await Keychain.setGenericPassword('token', token, { service: SERVICE });
  },
  async clear(): Promise<void> {
    await Keychain.resetGenericPassword({ service: SERVICE });
  },
};
