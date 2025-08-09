import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { supabase } from '../../services/supabase';
import { theme } from '../../styles/theme';

const PhoneLoginScreen = ({ navigation }: any) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendVerificationCode = async () => {
    if (!phoneNumber) {
      Alert.alert('Errore', 'Inserisci il numero di telefono');
      return;
    }

    setLoading(true);

    // In a real implementation, you would integrate with Twilio or another SMS provider
    // This is a placeholder for the actual implementation
    try {
      // Simulate sending verification code
      setTimeout(() => {
        setVerificationSent(true);
        setLoading(false);
        Alert.alert('Codice inviato', 'Un codice di verifica è stato inviato al tuo numero');
      }, 1500);

      // With Supabase and Twilio integration, you would do something like:
      // await supabase.auth.signInWithOtp({
      //   phone: phoneNumber
      // });
    } catch (error) {
      setLoading(false);
      Alert.alert('Errore', 'Impossibile inviare il codice di verifica');
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert('Errore', 'Inserisci il codice di verifica');
      return;
    }

    setLoading(true);

    // In a real implementation, you would verify the code with Supabase/Twilio
    // This is a placeholder for the actual implementation
    try {
      // Simulate verification
      setTimeout(() => {
        setLoading(false);
        // Navigate to home screen or handle login success
        Alert.alert('Successo', 'Accesso effettuato con successo!');
        // navigation.navigate('Home');
      }, 1500);

      // With Supabase and Twilio integration, you would do something like:
      // await supabase.auth.verifyOtp({
      //   phone: phoneNumber,
      //   token: verificationCode,
      //   type: 'sms'
      // });
    } catch (error) {
      setLoading(false);
      Alert.alert('Errore', 'Codice di verifica non valido');
    }
  };

  const handleBack = () => {
    if (verificationSent) {
      setVerificationSent(false);
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>
          {verificationSent ? 'Inserisci il codice' : 'Accedi con telefono'}
        </Text>
        <Text style={styles.subheader}>
          {verificationSent 
            ? 'Inserisci il codice di verifica inviato al tuo telefono'
            : 'Ti invieremo un codice di verifica via SMS'
          }
        </Text>
      </View>

      <View style={styles.formContainer}>
        {!verificationSent ? (
          <TextInput
            style={styles.input}
            placeholder="Numero di telefono (es. +39123456789)"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Codice di verifica"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
          />
        )}

        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={verificationSent ? handleVerifyCode : handleSendVerificationCode}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading 
              ? 'Elaborazione...' 
              : (verificationSent ? 'Verifica codice' : 'Invia codice')
            }
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>
            {verificationSent ? 'Cambia numero' : 'Torna indietro'}
          </Text>
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

export default PhoneLoginScreen; 