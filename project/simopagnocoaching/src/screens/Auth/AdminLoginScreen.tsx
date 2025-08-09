import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../services/supabase';
import { theme } from '../../styles/theme';

const AdminLoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);

  // The admin code should be stored securely in a backend environment variable
  // This is just a placeholder for demonstration
  const ADMIN_CODE = 'SIMONE_ADMIN_2023';

  const handleAdminLogin = async () => {
    if (!email || !password || !adminCode) {
      Alert.alert('Errore', 'Compila tutti i campi');
      return;
    }

    if (adminCode !== ADMIN_CODE) {
      Alert.alert('Errore', 'Codice admin non valido');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Errore di accesso', error.message);
      return;
    }

    // Check if the user has admin role in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', data.user?.id)
      .single();

    if (profileError) {
      Alert.alert('Errore', 'Impossibile verificare i permessi di admin');
      return;
    }

    if (profileData?.role !== 'admin') {
      Alert.alert('Accesso negato', 'Non hai i permessi di amministratore');
      // Sign out the user since they don't have admin privileges
      await supabase.auth.signOut();
      return;
    }

    // Navigate to admin dashboard
    navigation.navigate('AdminDashboard');
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Accesso Admin</Text>
        <Text style={styles.subheader}>Solo per amministratori autorizzati</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email Admin"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Codice Admin"
          value={adminCode}
          onChangeText={setAdminCode}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleAdminLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Accesso in corso...' : 'Accedi come Admin'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
          <Text style={styles.backButtonText}>Torna al login normale</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  headerContainer: {
    marginTop: theme.spacing.xl * 2,
    marginBottom: theme.spacing.xl,
  },
  header: {
    fontSize: theme.fonts.size.xxl,
    color: '#fff',
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  subheader: {
    fontSize: theme.fonts.size.md,
    color: '#fff',
    fontFamily: theme.fonts.regular,
  },
  formContainer: {
    width: '100%',
    marginTop: theme.spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    fontSize: theme.fonts.size.md,
    fontFamily: theme.fonts.regular,
    color: '#fff',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  buttonText: {
    color: '#fff',
    fontSize: theme.fonts.size.md,
    fontFamily: theme.fonts.bold,
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fonts.size.md,
    fontFamily: theme.fonts.regular,
  },
});

export default AdminLoginScreen; 