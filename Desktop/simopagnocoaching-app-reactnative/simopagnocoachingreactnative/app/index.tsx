import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    const handleNavigation = async () => {
      if (!loading) {
        try {
          if (isAuthenticated) {
            await router.replace('/(tabs)');
          } else {
            await router.replace('/login');
          }
        } catch (error) {
          console.error('Errore nella navigazione:', error);
          // Fallback: prova a navigare dopo un breve delay
          setTimeout(() => {
            if (isAuthenticated) {
              router.replace('/(tabs)');
            } else {
              router.replace('/login');
            }
          }, 1000);
        }
      }
    };

    handleNavigation();
  }, [isAuthenticated, loading, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#FF6B35" />
    </View>
  );
}
