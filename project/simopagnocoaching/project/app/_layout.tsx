import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { UserProfile } from '@/types/food';
import { getUserProfile } from '@/utils/storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const profile = await getUserProfile();
        setIsOnboarded(!!profile);
      } catch (error) {
        setIsOnboarded(false);
      }
    }
    checkOnboarding();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && isOnboarded !== null) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isOnboarded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (isOnboarded === null) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {!isOnboarded ? (
          <Stack.Screen name="onboarding" />
        ) : (
          <Stack.Screen name="(tabs)" />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}