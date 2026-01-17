import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCollectionStore } from '../lib/store';

export default function RootLayout() {
  // Initialize collection store on app load
  // This triggers hydration from AsyncStorage early
  const isHydrated = useCollectionStore((state) => state.isHydrated);

  useEffect(() => {
    if (isHydrated) {
      console.log('[Store] Collection hydrated from storage');
    }
  }, [isHydrated]);

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
