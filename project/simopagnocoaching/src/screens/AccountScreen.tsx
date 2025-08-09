import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Auth: { screen: string };
  Login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AccountScreen() {
  const { user, logout } = useContext(AuthContext);

  const handleSignOut = async () => {
    await logout();
    // Navigation will be handled by root based on authentication state
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <View style={styles.infoBox}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{user?.name || ''}</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user?.email || ''}</Text>
      </View>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181818',
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 32,
  },
  infoBox: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
    width: '100%',
    maxWidth: 340,
  },
  label: {
    color: '#aaa',
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 8,
  },
  value: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 8,
  },
  signOutButton: {
    backgroundColor: '#e53935',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
}); 