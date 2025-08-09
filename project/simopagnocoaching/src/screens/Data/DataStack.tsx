import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../../styles/theme';
import DataEntryScreen from './DataEntryScreen';
import ProgressScreen from './ProgressScreen';
import MealPlanScreen from './MealPlanScreen';

const Stack = createNativeStackNavigator();

const DataStack = () => {
  return (
    <Stack.Navigator
      id="DataStackNavigator"
      initialRouteName="DataEntry"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
        headerTitleStyle: {
          fontFamily: theme.fonts.bold,
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen 
        name="DataEntry" 
        component={DataEntryScreen} 
        options={{ 
          title: 'I tuoi Dati',
        }} 
      />
      <Stack.Screen 
        name="Progress" 
        component={ProgressScreen} 
        options={{ 
          title: 'Progressi',
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="MealPlan" 
        component={MealPlanScreen} 
        options={{ 
          title: 'Piano Alimentare',
          animation: 'slide_from_bottom',
        }} 
      />
    </Stack.Navigator>
  );
};

export default DataStack; 