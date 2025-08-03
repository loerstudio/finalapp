import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Colors } from '../constants/colors';
import QRCodeService from '../services/qrCode';

export default function QRCodeTest() {
  const [testData, setTestData] = useState('Test QR Code Data');

  const testQRGeneration = () => {
    try {
      const userQR = QRCodeService.generateUserQR('test-user-123', {
        name: 'Test User',
        email: 'test@example.com',
      });
      
      const workoutQR = QRCodeService.generateWorkoutQR('test-workout-456', {
        name: 'Test Workout',
        duration: '30 minutes',
      });
      
      Alert.alert(
        'Test QR Generation',
        `User QR: ${userQR.substring(0, 50)}...\nWorkout QR: ${workoutQR.substring(0, 50)}...`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', `QR Generation failed: ${error.message}`);
    }
  };

  const testQRParsing = () => {
    try {
      const testQRString = QRCodeService.generateDemoQR();
      const parsed = QRCodeService.parseQRCodeData(testQRString);
      
      if (parsed) {
        Alert.alert(
          'Test QR Parsing',
          `Successfully parsed QR code:\nType: ${parsed.type}\nID: ${parsed.id}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Test QR Parsing', 'Failed to parse QR code');
      }
    } catch (error) {
      Alert.alert('Error', `QR Parsing failed: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QR Code Test</Text>
      
      <View style={styles.qrContainer}>
        <QRCode
          value={testData}
          size={150}
          color={Colors.text}
          backgroundColor={Colors.background}
        />
      </View>
      
      <Text style={styles.dataText}>{testData}</Text>
      
      <TouchableOpacity style={styles.testButton} onPress={testQRGeneration}>
        <Text style={styles.testButtonText}>Test QR Generation</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.testButton} onPress={testQRParsing}>
        <Text style={styles.testButtonText}>Test QR Parsing</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={() => setTestData(`Test ${Date.now()}`)}
      >
        <Text style={styles.testButtonText}>Update Test Data</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 30,
  },
  qrContainer: {
    backgroundColor: Colors.text,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  dataText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  testButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
}); 