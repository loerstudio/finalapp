import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { AuthContext } from '../contexts/AuthContext';
import { OTPService } from '../lib/otpService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { signIn } = useContext(AuthContext);

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Errore', 'Inserisci la tua email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await OTPService.sendOTPForLogin(email.trim());
      
      if (response.success) {
        setOtpSent(true);
        setShowOtpInput(true);
        startCountdown();
        Alert.alert('Successo', response.message);
      } else {
        Alert.alert('Errore', response.message);
      }
    } catch (error) {
      Alert.alert('Errore', 'Errore durante l\'invio dell\'OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    await handleSendOTP();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Errore', 'Compila tutti i campi');
      return;
    }

    if (!otp.trim()) {
      Alert.alert('Errore', 'Inserisci il codice OTP');
      return;
    }

    setIsLoading(true);
    try {
      // Prima verifica l'OTP
      const otpResponse = await OTPService.verifyOTPForLogin(email.trim(), otp.trim());
      
      if (!otpResponse.success) {
        Alert.alert('Errore', otpResponse.message);
        return;
      }

      // Se OTP è valido, procedi con il login
      const success = await signIn(email.trim(), password);
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Errore', 'Credenziali non valide');
      }
    } catch (error) {
      Alert.alert('Errore', 'Errore durante il login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setShowOtpInput(false);
    setOtp('');
    setOtpSent(false);
    setCountdown(0);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.time}>11:41</Text>
          <View style={styles.statusIcons}>
            <View style={styles.signalIcon} />
            <View style={styles.wifiIcon} />
            <View style={styles.batteryIcon} />
          </View>
        </View>

        {/* Logo e Titolo */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>SP</Text>
          </View>
          <Text style={styles.title}>SimoPagno</Text>
          <Text style={styles.subtitle}>Coaching</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {!showOtpInput ? (
            // Form Email
            <>
              <Text style={styles.formTitle}>Accedi al tuo account</Text>
              <Text style={styles.formSubtitle}>
                Inserisci la tua email per ricevere il codice OTP
              </Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="la tua email"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Invio in corso...' : 'Invia OTP'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            // Form OTP
            <>
              <Text style={styles.formTitle}>Verifica OTP</Text>
              <Text style={styles.formSubtitle}>
                Inserisci il codice inviato a {email}
              </Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Codice OTP</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000000"
                  placeholderTextColor="#666"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                  maxLength={6}
                  textAlign="center"
                  style={[styles.input, styles.otpInput]}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="la tua password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Accesso in corso...' : 'Accedi'}
                </Text>
              </TouchableOpacity>

              <View style={styles.otpActions}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBackToEmail}
                >
                  <Text style={styles.backButtonText}>← Torna indietro</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.resendButton, countdown > 0 && styles.resendButtonDisabled]}
                  onPress={handleResendOTP}
                  disabled={countdown > 0}
                >
                  <Text style={styles.resendButtonText}>
                    {countdown > 0 ? `Riprova tra ${countdown}s` : 'Riprova OTP'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Non hai un account? Contatta il tuo coach per la registrazione.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  time: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signalIcon: {
    width: 20,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  wifiIcon: {
    width: 16,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  batteryIcon: {
    width: 24,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 60,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#FFD700',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFD700',
  },
  formContainer: {
    flex: 1,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
  otpInput: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  button: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  otpActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: '#999',
    fontSize: 16,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    color: '#999',
    fontSize: 16,
  },
  footerLink: {
    color: '#FFD700',
    fontWeight: '600',
  },
});
