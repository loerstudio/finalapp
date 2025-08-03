import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';
import { AuthService } from '../services/auth';
import { fixMissingUserProfiles } from '../utils/fixUsers';

interface LoginScreenProps {
  navigation: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [useOTP, setUseOTP] = useState(true);

  const handleEmailSubmit = async () => {
    if (!email) {
      Alert.alert('Errore', 'Inserisci la tua email');
      return;
    }

    setLoading(true);
    try {
      if (useOTP) {
        // Send OTP
        await AuthService.sendOTP(email);
        setStep('otp');
        Alert.alert(
          'Codice Inviato', 
          'Ti abbiamo inviato un codice di 6 cifre via email. Controlla la tua casella di posta.'
        );
      } else {
        // Check if user exists and proceed to password
        const userExists = await AuthService.checkUserExists(email);
        if (userExists) {
          setStep('password');
        } else {
          Alert.alert('Errore', 'Email non registrata. Contatta il tuo coach per registrarti.');
        }
      }
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore durante l\'invio del codice');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otpCode || otpCode.length !== 6) {
      Alert.alert('Errore', 'Inserisci il codice di 6 cifre');
      return;
    }

    setLoading(true);
    try {
      const user = await AuthService.verifyOTP(email, otpCode);
      if (user) {
        console.log('✅ Login successful for:', user.email, 'Role:', user.role);
        // Navigation will be handled automatically by the auth state listener
      }
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Codice non valido');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password) {
      Alert.alert('Errore', 'Inserisci la password');
      return;
    }

    setLoading(true);
    try {
      const user = await AuthService.signIn(email, password);
      if (user) {
        console.log('✅ Login successful for:', user.email, 'Role:', user.role);
        // Navigation will be handled automatically by the auth state listener
      }
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Credenziali non valide');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      await AuthService.sendOTP(email);
      Alert.alert('Codice Inviato', 'Nuovo codice inviato via email');
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore durante l\'invio del codice');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtpCode('');
    setPassword('');
  };

  const renderEmailStep = () => {
    return (
      <>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>✉️</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
        </View>

        <View style={styles.authMethodContainer}>
          <TouchableOpacity
            style={[styles.methodButton, useOTP && styles.methodButtonActive]}
            onPress={() => setUseOTP(true)}
          >
            <Text style={[styles.methodText, useOTP && styles.methodTextActive]}>
              🔐 Codice Email
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.methodButton, !useOTP && styles.methodButtonActive]}
            onPress={() => setUseOTP(false)}
          >
            <Text style={[styles.methodText, !useOTP && styles.methodTextActive]}>
              🔑 Password
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.demoCredentials}>
          <Text style={styles.demoTitle}>Demo Credentials:</Text>
          <Text style={styles.demoText}>Client: itsilorenz07@gmail.com</Text>
          <Text style={styles.demoText}>Coach: loerstudio0@gmail.com</Text>
          <Text style={styles.demoText}>Password: demo123</Text>
          
          {/* Temporary Fix Button */}
          <TouchableOpacity 
            style={[styles.fixButton, { marginTop: 10 }]}
            onPress={async () => {
              try {
                Alert.alert('🔧 Fixing Users', 'Attempting to fix missing user profiles...');
                await fixMissingUserProfiles();
                Alert.alert('✅ Success', 'User profiles fixed! Try logging in now.');
              } catch (error: any) {
                Alert.alert('❌ Error', error.message || 'Fix failed');
              }
            }}
          >
            <Text style={styles.fixButtonText}>🔧 Fix User Profiles</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={handleEmailSubmit}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Sending...' : useOTP ? 'Invia Codice' : 'Continua'}
          </Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderOtpStep = () => {
    return (
      <>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>Inserisci il Codice</Text>
          <Text style={styles.stepSubtitle}>
            Abbiamo inviato un codice di 6 cifre a{'\n'}{email}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Codice OTP</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔢</Text>
            <TextInput
              style={styles.input}
              placeholder="000000"
              placeholderTextColor="#888"
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="one-time-code"
            />
          </View>
        </View>

        <View style={styles.otpActions}>
          <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
            <Text style={styles.resendText}>Non hai ricevuto il codice? Invia di nuovo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={handleOtpSubmit}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Verifying...' : 'Verifica Codice'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToEmail}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>← Indietro</Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderPasswordStep = () => {
    return (
      <>
        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>Inserisci Password</Text>
          <Text style={styles.stepSubtitle}>
            Accedi con la tua password per{'\n'}{email}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>🔒</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.inputIcon}>{showPassword ? '👁️' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={handlePasswordSubmit}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Signing in...' : 'Accedi'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToEmail}
          disabled={loading}
        >
          <Text style={styles.backButtonText}>← Indietro</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>SPC Fitness</Text>
          <Text style={styles.subtitle}>Coach Portal</Text>

          <View style={styles.form}>
            {step === 'email' && renderEmailStep()}
            {step === 'otp' && renderOtpStep()}
            {step === 'password' && renderPasswordStep()}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 22,
    color: '#DC143C',
    textAlign: 'center',
    marginBottom: 80,
    fontWeight: '700',
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 28,
  },
  inputLabel: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 12,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: '#555555',
  },
  inputIcon: {
    fontSize: 22,
    marginRight: 15,
    color: '#ffffff',
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 8,
  },
  authMethodContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: Colors.primary,
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  methodTextActive: {
    color: Colors.text,
  },
  demoCredentials: {
    backgroundColor: '#333333',
    borderRadius: 12,
    padding: 20,
    marginBottom: 40,
    borderWidth: 2,
    borderColor: '#555555',
  },
  demoTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  demoText: {
    color: '#cccccc',
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '500',
  },
  otpActions: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#B22222',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  fixButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  fixButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});