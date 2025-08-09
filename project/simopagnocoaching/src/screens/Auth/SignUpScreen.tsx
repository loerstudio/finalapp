import React, { useState, useContext } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Image } from 'react-native';
import { theme } from '../../styles/theme';
import { AuthContext } from '../../context/AuthContext';

const SignUpScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      Alert.alert('Errore', 'Compila tutti i campi');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Errore', 'Le password non corrispondono');
      return;
    }
    setLoading(true);
    const success = await register(fullName, email, password);
    setLoading(false);
    if (success) {
      navigation.replace('Main');
    } else {
      Alert.alert('Errore', 'Email già registrata');
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/simopagnocoachinglogo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Crea il tuo account</Text>
        <Text style={styles.subheader}>Registrati per iniziare il tuo percorso di allenamento</Text>
      </View>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome e Cognome"
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
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
          placeholder="Conferma Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Registrazione in corso...' : 'Registrati'}
          </Text>
        </TouchableOpacity>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Hai già un account? </Text>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.linkText}>Accedi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: theme.spacing.lg,
  },
  logoImage: {
    width: 260,
    height: 180,
    marginBottom: 0,
  },
  headerContainer: {
    marginTop: 0,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
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
    justifyContent: 'flex-start',
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  socialButtonText: {
    color: 'white',
    fontSize: theme.fonts.size.md,
    fontFamily: theme.fonts.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  footerText: {
    color: '#fff',
    fontFamily: theme.fonts.regular,
  },
  linkText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
});

export default SignUpScreen; 