import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { theme } from './src/styles/theme';
import BottomTabNavigator from './src/components/navigation/BottomTabNavigator';
import SimoZeroSbatttiBot from './src/components/common/SimoZeroSbatttiBot';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import LoginScreen from './src/screens/Auth/LoginScreen';
import SignUpScreen from './src/screens/Auth/SignUpScreen';
import AppNavigator from './src/navigation/AppNavigator';

function MainApp() {
  const { isAuthenticated } = useContext(AuthContext);
  const [showSignUp, setShowSignUp] = React.useState(false);

  if (!isAuthenticated) {
    return showSignUp ? (
      <SignUpScreen navigation={{ navigate: () => setShowSignUp(false) }} />
    ) : (
      <LoginScreen navigation={{ navigate: () => setShowSignUp(true) }} />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <BottomTabNavigator />
      <SimoZeroSbatttiBot />
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
}); 