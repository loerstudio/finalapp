import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
// Comment out the I18n import
// import { useI18n } from '../context/I18nContext';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import VideoListScreen from '../screens/Video/VideoListScreen';
import PhotoGalleryScreen from '../screens/Photo/PhotoGalleryScreen';
import DataEntryScreen from '../screens/Data/DataEntryScreen';
import SettingsScreen from '../screens/Settings';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  const { theme } = useTheme();
  
  // Simple translation function
  const t = (key) => {
    const translations = {
      'home': 'Home',
      'videos': 'Video',
      'photos': 'Foto',
      'data': 'Dati',
      'settings': 'Impostazioni'
    };
    return translations[key] || key;
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          paddingTop: 5,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
        tabBarLabelStyle: {
          fontFamily: theme.fonts.medium,
          fontSize: 12,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          title: t('home'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Videos" 
        component={VideoListScreen} 
        options={{
          title: t('videos'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'videocam' : 'videocam-outline'} size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Photos" 
        component={PhotoGalleryScreen} 
        options={{
          title: t('photos'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'camera' : 'camera-outline'} size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Data" 
        component={DataEntryScreen} 
        options={{
          title: t('data'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'analytics' : 'analytics-outline'} size={size} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{
          title: t('settings'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
          ),
        }} 
      />
    </Tab.Navigator>
  );
} 