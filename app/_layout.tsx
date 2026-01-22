import { useEffect } from 'react';
import { Stack, useSegments, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Sentry from 'sentry-expo';
import { useCollectionStore } from '../lib/store';

// Initialize Sentry for crash reporting
Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableInExpoDevelopment: false, // Don't report in dev
  debug: __DEV__, // Log Sentry events in dev for debugging
});

export default function RootLayout() {
  const segments = useSegments();
  const { isHydrated, hasCompletedOnboarding } = useCollectionStore();

  // Handle onboarding redirect
  useEffect(() => {
    if (!isHydrated) return; // Wait for store to hydrate

    const inOnboarding = segments[0] === 'onboarding';

    if (!hasCompletedOnboarding && !inOnboarding) {
      // User hasn't completed onboarding, redirect there
      router.replace('/onboarding');
    } else if (hasCompletedOnboarding && inOnboarding) {
      // User completed onboarding but is on onboarding screen, redirect home
      router.replace('/');
    }
  }, [isHydrated, hasCompletedOnboarding, segments]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F8F9FA' },
          animation: 'fade',
        }}
      />
    </>
  );
}
