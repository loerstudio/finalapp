import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../../styles/theme';
import PhotoGalleryScreen from './PhotoGalleryScreen';
import PhotoUploadScreen from './PhotoUploadScreen';
import PhotoViewerScreen from './PhotoViewerScreen';

const Stack = createNativeStackNavigator();

const PhotoStack = () => {
  return (
    <Stack.Navigator
      id="PhotoStackNavigator"
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
        name="PhotoGallery" 
        component={PhotoGalleryScreen} 
        options={{ 
          title: 'Le tue Foto',
          animation: 'slide_from_right',
        }} 
      />
      <Stack.Screen 
        name="PhotoUpload" 
        component={PhotoUploadScreen} 
        options={{ 
          title: 'Carica Foto',
          animation: 'slide_from_bottom',
        }} 
      />
      <Stack.Screen 
        name="PhotoViewer" 
        component={PhotoViewerScreen} 
        options={{ 
          title: 'Visualizza Foto',
          animation: 'fade',
        }} 
      />
    </Stack.Navigator>
  );
};

export default PhotoStack; 