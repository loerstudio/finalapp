import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import Button from './Button';
import Input from './Input';

/**
 * Esempio di utilizzo dei componenti del design system
 * Questo file mostra come utilizzare Button e Input in diversi scenari
 */

export default function ExampleUsage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Errore', 'Compila tutti i campi');
      return;
    }
    
    setLoading(true);
    // Simula login
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Successo', 'Login effettuato!');
    }, 2000);
  };

  const handleCancel = () => {
    setEmail('');
    setPassword('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Esempio Design System</Text>
        <Text style={styles.subtitle}>Come utilizzare i componenti UI</Text>
      </View>

      {/* Form di esempio */}
      <View style={styles.form}>
        <Input
          label="Email"
          icon="mail"
          placeholder="Inserisci la tua email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Password"
          icon="lock-closed"
          placeholder="Inserisci la password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Bottoni con diverse varianti */}
        <View style={styles.buttonGroup}>
          <Button
            title="Accedi"
            onPress={handleLogin}
            loading={loading}
            icon="log-in"
            iconPosition="right"
            size="large"
          />
        </View>

        <View style={styles.buttonRow}>
          <Button
            title="Annulla"
            onPress={handleCancel}
            variant="outline"
            icon="close"
            iconPosition="left"
            size="medium"
          />
          
          <Button
            title="Registrati"
            onPress={() => Alert.alert('Info', 'Registrazione')}
            variant="secondary"
            icon="person-add"
            iconPosition="right"
            size="medium"
          />
        </View>

        {/* Bottoni con diverse dimensioni */}
        <View style={styles.sizeExamples}>
          <Text style={styles.sectionTitle}>Dimensioni Bottoni:</Text>
          
          <View style={styles.buttonRow}>
            <Button
              title="Small"
              onPress={() => {}}
              size="small"
            />
            <Button
              title="Medium"
              onPress={() => {}}
              size="medium"
            />
            <Button
              title="Large"
              onPress={() => {}}
              size="large"
            />
          </View>
        </View>

        {/* Input con errori */}
        <View style={styles.errorExamples}>
          <Text style={styles.sectionTitle}>Input con Errori:</Text>
          
          <Input
            label="Campo con Errore"
            icon="alert-circle"
            placeholder="Questo campo ha un errore"
            error="Questo campo è obbligatorio"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.fitness.background,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.fitness.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.fitness.textSecondary,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  buttonGroup: {
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  sizeExamples: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.fitness.textPrimary,
    marginBottom: 16,
  },
  errorExamples: {
    marginBottom: 24,
  },
});
