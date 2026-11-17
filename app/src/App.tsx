import { DarkTheme, DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SessionProvider } from '@/lib/session';
import { RootNavigator } from '@/navigation/RootNavigator';
import { palette } from '@/theme';

export default function App() {
  const isDark = useColorScheme() === 'dark';
  const c = isDark ? palette.dark : palette.light;
  const base = isDark ? DarkTheme : DefaultTheme;

  const navTheme: Theme = {
    ...base,
    colors: {
      ...base.colors,
      primary: c.primary,
      background: c.background,
      card: c.background,
      text: c.text,
      border: c.border,
    },
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SessionProvider>
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
