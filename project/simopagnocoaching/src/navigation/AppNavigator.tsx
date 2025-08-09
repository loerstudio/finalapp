import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from '../components/navigation/BottomTabNavigator';
import ChatbotScreen from '../screens/ChatbotScreen';
import SimoZeroSbatttiBot from '../components/common/SimoZeroSbatttiBot';
import { View, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen name="ChatbotScreen" component={ChatbotScreen} />
      </Stack.Navigator>
      <SimoZeroSbatttiBot />
    </View>
  );
} 