import { Stack, useSegments, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useCollectionStore } from '../lib/store';

// TODO: Re-enable Sentry after fixing iOS build compatibility
// import * as Sentry from 'sentry-expo';
// Sentry.init({
//   dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
//   enableInExpoDevelopment: false,
//   debug: __DEV__,
// });

export default function RootLayout() {
  const segments = useSegments();
  const { isHydrated, hasCompletedOnboarding } = useCollectionStore();

  // Show loading while store hydrates
  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  const inOnboarding = segments[0] === 'onboarding';

  // Only redirect TO onboarding if user hasn't completed it
  // Don't redirect AWAY from onboarding - let onboarding.tsx handle its own navigation
  if (!hasCompletedOnboarding && !inOnboarding) {
    return <Redirect href="/onboarding" />;
  }

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
