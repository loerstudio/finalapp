import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseAuthService } from '@/lib/supabaseAuthService';
import { Colors } from '@/constants/Colors';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { signInWithOTP } = useAuth();

  const handleSendOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Errore', 'Inserisci la tua email');
      return;
    }

    setLoading(true);
    try {
      const result = await supabaseAuthService.loginWithOTP(email.trim());
      
      if (result.success) {
        setShowOTPInput(true);
        setOtpSent(true);
        Alert.alert(
          'OTP Inviato',
          `Il codice OTP è stato inviato a ${email}.\n\nControlla la tua casella email e inserisci il codice qui sotto.\n\nNota: Supabase invierà l'OTP direttamente alla tua email.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Errore', result.error || 'Errore nell\'invio OTP');
      }
    } catch (error) {
      Alert.alert('Errore', 'Errore nell\'invio OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Errore', 'Inserisci il codice OTP');
      return;
    }

    setLoading(true);
    try {
      // Usa direttamente il contesto di autenticazione
      const result = await signInWithOTP(email.trim(), otp.trim());
      
      if (!result.error) {
        // Login riuscito - il contesto gestirà la navigazione
        setShowOTPInput(false);
        setOtpSent(false);
        setEmail('');
        setOtp('');
      } else {
        Alert.alert('Errore', result.error || 'OTP non valido');
      }
    } catch (error) {
      Alert.alert('Errore', 'Errore nella verifica OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setShowOTPInput(false);
    setOtpSent(false);
    setOtp('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Header with modern design */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBackground}>
                <Ionicons name="fitness" size={60} color={Colors.fitness.primary} />
              </View>
            </View>
            <Text style={styles.title}>SimoPagno Coaching</Text>
            <Text style={styles.subtitle}>
              {showOTPInput ? 'Verifica il tuo codice OTP' : 'Accedi al tuo account'}
            </Text>
            <Text style={styles.tagline}>
              {showOTPInput 
                ? 'Inserisci il codice di 6 cifre inviato alla tua email'
                : 'Transform Your Body, Transform Your Life'
              }
            </Text>
          </View>

          {/* Form with modern styling */}
          <View style={styles.form}>
            {!showOTPInput ? (
              // Email Input
              <View style={styles.inputContainer}>
                <Input
                  label="Email"
                  icon="mail"
                  placeholder="Inserisci la tua email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                
                <Button
                  title="Invia OTP"
                  onPress={handleSendOTP}
                  loading={loading}
                  icon="arrow-forward"
                  iconPosition="right"
                  size="large"
                />
              </View>
            ) : (
              // OTP Input
              <View style={styles.inputContainer}>
                <Input
                  label="Codice OTP"
                  icon="key"
                  placeholder="Inserisci il codice OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                
                <Button
                  title="Verifica OTP"
                  onPress={handleVerifyOTP}
                  loading={loading}
                  icon="checkmark-circle"
                  iconPosition="right"
                  size="large"
                />
                
                <Button
                  title="Torna all'email"
                  onPress={handleBackToEmail}
                  variant="secondary"
                  icon="arrow-back"
                  iconPosition="left"
                  size="medium"
                />
              </View>
            )}
          </View>

          {/* Info section */}
          <View style={styles.info}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color={Colors.fitness.accent} />
              <Text style={styles.infoText}>
                {showOTPInput 
                  ? 'Il codice OTP è stato inviato alla tua email registrata'
                  : 'Riceverai un codice OTP per accedere in modo sicuro'
                }
              </Text>
            </View>
          </View>

          {/* Bottom decoration */}
          <View style={styles.bottomDecoration}>
            <View style={styles.decorationCircle} />
            <View style={styles.decorationCircle} />
            <View style={styles.decorationCircle} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.fitness.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.fitness.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.fitness.primary,
    shadowColor: Colors.fitness.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.fitness.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.fitness.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.fitness.accent,
    textAlign: 'center',
    fontWeight: '600',
  },
  form: {
    marginBottom: 40,
  },
  inputContainer: {
    gap: 24,
  },
  info: {
    alignItems: 'center',
    marginBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.fitness.surface,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.fitness.card,
    gap: 12,
    maxWidth: width - 48,
  },
  infoText: {
    fontSize: 14,
    color: Colors.fitness.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    flex: 1,
  },
  bottomDecoration: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  decorationCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.fitness.accent,
    opacity: 0.6,
  },
});
