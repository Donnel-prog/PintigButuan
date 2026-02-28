import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

export const unstable_settings = {
  initialRouteName: 'onboarding',
};

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, hasSeenOnboarding, isLoading, checkAuth } = useAuthStore();
  const { loadTheme } = useThemeStore();

  useEffect(() => {
    checkAuth();
    loadTheme();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const authSafeRoutes = ['(tabs)', 'article', 'settings'];
    const inAuthGroup = segments[0] && authSafeRoutes.includes(segments[0]);
    const onLogin = segments[0] === 'login';
    const onOnboarding = segments[0] === 'onboarding';

    if (!hasSeenOnboarding && !onOnboarding) {
      router.replace('/onboarding');
    } else if (hasSeenOnboarding && !isAuthenticated && !onLogin) {
      router.replace('/login');
    } else if (isAuthenticated && !inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, hasSeenOnboarding, isLoading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const { isDarkMode, colors } = useThemeStore();

  // Pintig Butuan themed navigation
  const navTheme = {
    ...(isDarkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDarkMode ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      border: colors.border,
      primary: colors.cyan,
      text: colors.textPrimary,
    },
  };

  // Liquid Glass Background
  const BackgroundShapes = () => (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={isDarkMode ? ['#051937', '#004d7a', '#008793', '#00bf72', '#a8eb12'] : ['#a18cd1', '#fbc2eb', '#fad0c4']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <BlurView intensity={isDarkMode ? 80 : 100} tint={isDarkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
    </View>
  );

  return (
    <ThemeProvider value={navTheme}>
      <BackgroundShapes />
      <AuthGate>
        <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="article/[id]" options={{ animation: 'slide_from_right', contentStyle: { backgroundColor: 'transparent' } }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', contentStyle: { backgroundColor: 'transparent' } }} />
        </Stack>
      </AuthGate>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </ThemeProvider>
  );
}
