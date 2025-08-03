import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import ClientHomeScreen from './src/screens/ClientHomeScreen';
import CoachHomeScreen from './src/screens/CoachHomeScreen';
import Navigation from './src/components/Navigation';

// Import services
import { AuthService } from './src/services/auth';
import { initializeDatabase } from './src/services/appwrite';
import { User } from './src/types';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAppwriteReady, setIsAppwriteReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing SPC Fitness App...');
      
      // Initialize Appwrite database
      await initializeDatabase();
      setIsAppwriteReady(true);
      console.log('✅ Appwrite initialized');
      
      // Check authentication state
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      
      console.log('✅ App initialization complete');
    } catch (error) {
      console.error('❌ App initialization error:', error);
    } finally {
      setIsLoading(false);
      await SplashScreen.hideAsync();
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    if (!isAppwriteReady) return;

    const unsubscribe = AuthService.onAuthStateChange((user) => {
      console.log('🔄 Auth state changed:', user ? user.email : 'No user');
      setUser(user);
    });

    return unsubscribe;
  }, [isAppwriteReady]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>SPC Fitness</Text>
        <Text style={styles.loadingSubtext}>Caricamento...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // User is authenticated
          <Stack.Screen 
            name="Main" 
            component={Navigation} 
            initialParams={{ user }}
          />
        ) : (
          // User is not authenticated
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#ccc',
  },
}); 