import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../../styles/theme';
import VideoListScreen from './VideoListScreen';
import VideoUploadScreen from './VideoUploadScreen';
import VideoPlayerScreen from './VideoPlayerScreen';

const Stack = createNativeStackNavigator();

const VideoStack = () => {
  return (
    <Stack.Navigator
      id="VideoStackNavigator"
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
        name="VideoList" 
        component={VideoListScreen} 
        options={{ 
          title: 'I tuoi Video',
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="VideoUpload" 
        component={VideoUploadScreen} 
        options={{ 
          title: 'Carica Video',
          animation: 'slide_from_bottom',
        }} 
      />
      <Stack.Screen 
        name="VideoPlayer" 
        component={VideoPlayerScreen} 
        options={{ 
          title: 'Riproduci Video',
          animation: 'fade',
        }} 
      />
    </Stack.Navigator>
  );
};

export default VideoStack; 