import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { Colors } from '../constants/colors';
import { AuthService } from '../services/auth';
import { User } from '../types';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CoachHomeScreen from '../screens/CoachHomeScreen';
import ChatScreen from '../screens/ChatScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import NutritionScreen from '../screens/NutritionScreen';
import ProgressScreen from '../screens/ProgressScreen';
import AccountScreen from '../screens/AccountScreen';
import ClientManagementScreen from '../screens/ClientManagementScreen';
import WorkoutProgramsScreen from '../screens/WorkoutProgramsScreen';
import NutritionPlansScreen from '../screens/NutritionPlansScreen';
import ClientProgressScreen from '../screens/ClientProgressScreen';
import ExerciseLibraryScreen from '../screens/ExerciseLibraryScreen';
import FoodDatabaseScreen from '../screens/FoodDatabaseScreen';
import FoodScanScreen from '../screens/FoodScanScreen';
import LiveWorkoutScreen from '../screens/LiveWorkoutScreen';
import CoachManagementScreen from '../screens/CoachManagementScreen';
import CoachChatScreen from '../screens/CoachChatScreen';
import QRCodeScreen from '../screens/QRCodeScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function LoadingScreen() {
  const handleForceLogout = async () => {
    try {
      console.log('🚪 Force logout initiated...');
      await AuthService.signOut();
      console.log('✅ Force logout completed');
      
      // Force reload the app
      setTimeout(() => {
        console.log('🔄 Reloading app...');
        // This will trigger a re-render and show login screen
      }, 1000);
      
    } catch (error) {
      console.error('Force logout error:', error);
    }
  };

  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>SPC Fitness</Text>
      <Text style={styles.loadingSubtext}>Loading...</Text>
      
      {/* Debug button - tap if stuck */}
      <TouchableOpacity 
        style={styles.debugButton}
        onPress={handleForceLogout}
      >
        <Text style={styles.debugButtonText}>Tap if stuck</Text>
      </TouchableOpacity>
    </View>
  );
}

function ClientTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Workout') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Nutrition') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBackground,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: Colors.headerBackground,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: Colors.headerText,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          headerTitle: 'SPC Fitness - Client',
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          headerTitle: 'Chat Coach',
        }}
      />
      <Tab.Screen 
        name="Workout" 
        component={WorkoutScreen}
        options={{
          headerTitle: 'My Workouts',
        }}
      />
      <Tab.Screen 
        name="Nutrition" 
        component={NutritionScreen}
        options={{
          headerTitle: 'Nutrition Plan',
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{
          headerTitle: 'My Progress',
        }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountScreen}
        options={{
          headerTitle: 'Account',
        }}
      />
    </Tab.Navigator>
  );
}

function CoachTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Workout') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Nutrition') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'school' : 'school-outline';
          } else {
            iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBackground,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: Colors.headerBackground,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: Colors.headerText,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={CoachHomeScreen}
        options={{
          headerTitle: 'SPC Fitness - Coach Portal',
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen}
        options={{
          headerTitle: 'Client Chats',
        }}
      />
      <Tab.Screen 
        name="Workout" 
        component={WorkoutScreen}
        options={{
          headerTitle: 'Workout Programs',
        }}
      />
      <Tab.Screen 
        name="Nutrition" 
        component={NutritionScreen}
        options={{
          headerTitle: 'Nutrition Plans',
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{
          headerTitle: 'Client Progress',
        }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountScreen}
        options={{
          headerTitle: 'Coach Account',
        }}
      />
    </Tab.Navigator>
  );
}

function CoachStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.headerBackground,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: Colors.headerText,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        cardStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen 
        name="CoachMain" 
        component={CoachTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ClientManagement" 
        component={ClientManagementScreen}
        options={{ 
          headerShown: true,
          title: 'Client Management',
        }}
      />
      <Stack.Screen 
        name="WorkoutPrograms" 
        component={WorkoutProgramsScreen}
        options={{ 
          headerShown: true,
          title: 'Workout Programs',
        }}
      />
      <Stack.Screen 
        name="NutritionPlans" 
        component={NutritionPlansScreen}
        options={{ 
          headerShown: true,
          title: 'Nutrition Plans',
        }}
      />
      <Stack.Screen 
        name="ClientProgress" 
        component={ClientProgressScreen}
        options={{ 
          headerShown: true,
          title: 'Client Progress',
        }}
      />
      <Stack.Screen 
        name="ExerciseLibrary" 
        component={ExerciseLibraryScreen}
        options={{ 
          headerShown: true,
          title: 'Exercise Library',
        }}
      />
      <Stack.Screen 
        name="FoodDatabase" 
        component={FoodDatabaseScreen}
        options={{ 
          headerShown: true,
          title: 'Food Database',
        }}
      />
      <Stack.Screen 
        name="FoodScan" 
        component={FoodScanScreen}
        options={{ 
          headerShown: true,
          title: 'Scan Food',
        }}
      />
      <Stack.Screen 
        name="LiveWorkout" 
        component={LiveWorkoutScreen}
        options={{ 
          headerShown: true,
          title: 'Live Workout',
        }}
      />
      <Stack.Screen 
        name="CoachManagement" 
        component={CoachManagementScreen}
        options={{ 
          headerShown: true,
          title: 'Coach Management',
        }}
      />
      <Stack.Screen 
        name="CoachChat" 
        component={CoachChatScreen}
        options={{ 
          headerShown: true,
          title: 'Coach Chat',
        }}
      />
    </Stack.Navigator>
  );
}

function ClientStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.headerBackground,
          borderBottomColor: Colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: Colors.headerText,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
        cardStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen 
        name="ClientMain" 
        component={ClientTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="QRCode" 
        component={QRCodeScreen}
        options={{ 
          headerShown: false,
          title: 'QR Code',
        }}
      />
    </Stack.Navigator>
  );
}

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
    
    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      setUser(user);
    });

    // Force logout after 15 seconds if still loading
    const forceLogoutTimer = setTimeout(() => {
      if (isLoading) {
        console.log('⚠️ Force logout due to timeout');
        AuthService.signOut().catch(console.error);
        setIsLoading(false);
        setUser(null);
      }
    }, 15000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(forceLogoutTimer);
    };
  }, [isLoading]);

  const checkUser = async () => {
    try {
      console.log('🔍 Navigation: Checking for existing user session...');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth timeout')), 8000);
      });
      
      // First try to get current user (this will try to refresh session if needed)
      const currentUserPromise = AuthService.getCurrentUser();
      
      const currentUser = await Promise.race([currentUserPromise, timeoutPromise]);
      
      if (currentUser) {
        console.log('✅ Found existing session for:', currentUser.email);
        setUser(currentUser);
      } else {
        console.log('❌ No existing session found');
        setUser(null);
      }
    } catch (error) {
      console.error('Navigation auth error:', error);
      
      // If it's a timeout, try one more time
      if (error.message === 'Auth timeout') {
        console.log('🔄 Retrying auth check...');
        try {
          const retryUser = await AuthService.getCurrentUser();
          if (retryUser) {
            console.log('✅ Retry successful for:', retryUser.email);
            setUser(retryUser);
          } else {
            setUser(null);
          }
        } catch (retryError) {
          console.error('Retry failed:', retryError);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: Colors.primary,
          background: Colors.background,
          card: Colors.surface,
          text: Colors.text,
          border: Colors.border,
          notification: Colors.primary,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.headerBackground,
            borderBottomColor: Colors.border,
            borderBottomWidth: 1,
          },
          headerTintColor: Colors.headerText,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          cardStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        {user ? (
          user.role === 'coach' ? (
            <Stack.Screen 
              name="CoachStack" 
              component={CoachStackNavigator} 
              options={{ headerShown: false }}
            />
          ) : (
            <Stack.Screen 
              name="ClientStack" 
              component={ClientStackNavigator} 
              options={{ headerShown: false }}
            />
          )
        ) : (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
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
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 42,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 16,
    letterSpacing: 1,
  },
  loadingSubtext: {
    fontSize: 18,
    color: Colors.textSecondary,
    opacity: 0.8,
  },
  debugButton: {
    marginTop: 40,
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  debugButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    opacity: 0.7,
    fontWeight: '600',
  },
});