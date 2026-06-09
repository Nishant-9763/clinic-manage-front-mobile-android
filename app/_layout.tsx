import { useEffect } from 'react';
import { Stack, Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../src/store/useAuthStore';
import { useClinicStore } from '../src/store/useClinicStore';

// Prevent splash screen auto hide
SplashScreen.preventAutoHideAsync();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0ea5e9',
    secondary: '#10b981',
    tertiary: '#14b8a6',
    background: '#f8fafc',
    surface: '#ffffff',
  },
};

export default function RootLayout() {
  const { isAuthenticated, isLoading: authLoading, initializeAuth } = useAuthStore();
  const { isLoading: dbLoading, initializeDb } = useClinicStore();

  useEffect(() => {
    async function init() {
      try {
        await initializeAuth();
        await initializeDb();
      } catch (e) {
        console.error('Initialization error', e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    init();
  }, [initializeAuth, initializeDb]);

  const isLoading = authLoading || dbLoading;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        )}
      </Stack>
    </PaperProvider>
  );
}
