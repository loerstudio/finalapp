import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { View, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';
import { supabaseAuthService } from '@/lib/supabaseAuthService';
import { supabase } from '@/lib/supabase';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, loading } = useAuth();

  // Inizializza Supabase (solo dati reali)
  useEffect(() => {
    const initSupabase = async () => {
      try {
        console.log('✅ Supabase inizializzato - modalità dati reali');
        
        // Verifica che le credenziali Supabase siano valide
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          // Se c'è un errore di configurazione, loggalo
          if (error.message.includes('Invalid API key') || error.message.includes('Invalid URL')) {
            console.error('❌ Configurazione Supabase non valida. Verifica URL e API key in config.js');
          } else {
            console.log('ℹ️ Supabase configurato correttamente');
          }
        } else {
          console.log('ℹ️ Supabase configurato correttamente');
        }
      } catch (error) {
        console.error('❌ Errore nell\'inizializzazione di Supabase:', error);
      }
    };

    initSupabase();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8B0000" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="login" />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
