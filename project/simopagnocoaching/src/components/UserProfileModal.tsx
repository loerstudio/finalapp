import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { UserProfile } from '../services/aiService';

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

export default function UserProfileModal({ 
  visible, 
  onClose, 
  onSave, 
  initialProfile 
}: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile>({
    id: '1',
    gender: '',
    age: 0,
    weight: 0,
    height: 0,
    calorieDeficit: 0,
    carbPercentage: 40,
    proteinPercentage: 30,
    fatPercentage: 30,
    goals: ''
  });

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  const handleSave = () => {
    // Basic validation
    if (!profile.gender || profile.age <= 0 || profile.weight <= 0 || profile.height <= 0) {
      Alert.alert('Errore', 'Compila tutti i campi obbligatori');
      return;
    }

    if (profile.carbPercentage + profile.proteinPercentage + profile.fatPercentage !== 100) {
      Alert.alert('Errore', 'Le percentuali di macronutrienti devono sommare al 100%');
      return;
    }

    onSave(profile);
    onClose();
  };

  const updateProfile = (field: keyof UserProfile, value: string | number) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Profilo Utente</Text>
            <Text style={styles.modalSubtitle}>
              Configura il tuo profilo per ricevere raccomandazioni personalizzate
            </Text>

            {/* Gender Selection */}
            <Text style={styles.label}>Genere *</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  profile.gender === 'male' && styles.genderButtonActive
                ]}
                onPress={() => updateProfile('gender', 'male')}
              >
                <Text style={[
                  styles.genderButtonText,
                  profile.gender === 'male' && styles.genderButtonTextActive
                ]}>
                  Uomo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  profile.gender === 'female' && styles.genderButtonActive
                ]}
                onPress={() => updateProfile('gender', 'female')}
              >
                <Text style={[
                  styles.genderButtonText,
                  profile.gender === 'female' && styles.genderButtonTextActive
                ]}>
                  Donna
                </Text>
              </TouchableOpacity>
            </View>

            {/* Age */}
            <Text style={styles.label}>Età (anni) *</Text>
            <TextInput
              style={styles.input}
              placeholder="25"
              placeholderTextColor="#666"
              value={profile.age > 0 ? profile.age.toString() : ''}
              onChangeText={(value) => updateProfile('age', parseInt(value) || 0)}
              keyboardType="numeric"
            />

            {/* Weight */}
            <Text style={styles.label}>Peso (kg) *</Text>
            <TextInput
              style={styles.input}
              placeholder="70"
              placeholderTextColor="#666"
              value={profile.weight > 0 ? profile.weight.toString() : ''}
              onChangeText={(value) => updateProfile('weight', parseFloat(value) || 0)}
              keyboardType="numeric"
            />

            {/* Height */}
            <Text style={styles.label}>Altezza (cm) *</Text>
            <TextInput
              style={styles.input}
              placeholder="175"
              placeholderTextColor="#666"
              value={profile.height > 0 ? profile.height.toString() : ''}
              onChangeText={(value) => updateProfile('height', parseInt(value) || 0)}
              keyboardType="numeric"
            />

            {/* Calorie Deficit */}
            <Text style={styles.label}>Deficit Calorico (kcal)</Text>
            <TextInput
              style={styles.input}
              placeholder="500"
              placeholderTextColor="#666"
              value={profile.calorieDeficit > 0 ? profile.calorieDeficit.toString() : ''}
              onChangeText={(value) => updateProfile('calorieDeficit', parseInt(value) || 0)}
              keyboardType="numeric"
            />

            {/* Macronutrient Distribution */}
            <Text style={styles.label}>Distribuzione Macronutrienti (%)</Text>
            
            <Text style={styles.macroLabel}>Carboidrati</Text>
            <TextInput
              style={styles.macroInput}
              placeholder="40"
              placeholderTextColor="#666"
              value={profile.carbPercentage.toString()}
              onChangeText={(value) => updateProfile('carbPercentage', parseInt(value) || 0)}
              keyboardType="numeric"
            />

            <Text style={styles.macroLabel}>Proteine</Text>
            <TextInput
              style={styles.macroInput}
              placeholder="30"
              placeholderTextColor="#666"
              value={profile.proteinPercentage.toString()}
              onChangeText={(value) => updateProfile('proteinPercentage', parseInt(value) || 0)}
              keyboardType="numeric"
            />

            <Text style={styles.macroLabel}>Grassi</Text>
            <TextInput
              style={styles.macroInput}
              placeholder="30"
              placeholderTextColor="#666"
              value={profile.fatPercentage.toString()}
              onChangeText={(value) => updateProfile('fatPercentage', parseInt(value) || 0)}
              keyboardType="numeric"
            />

            <Text style={[
              styles.macroTotal,
              { color: profile.carbPercentage + profile.proteinPercentage + profile.fatPercentage === 100 ? '#4CAF50' : '#e53935' }
            ]}>
              Totale: {profile.carbPercentage + profile.proteinPercentage + profile.fatPercentage}%
            </Text>

            {/* Goals */}
            <Text style={styles.label}>Obiettivi</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Es: Perdere peso, aumentare massa muscolare, mantenere forma fisica..."
              placeholderTextColor="#666"
              value={profile.goals}
              onChangeText={(value) => updateProfile('goals', value)}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleSave}
              >
                <Text style={styles.confirmButtonText}>Salva</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#232323',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#e53935',
  },
  genderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  genderButtonTextActive: {
    color: '#fff',
  },
  macroLabel: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 4,
  },
  macroInput: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 8,
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 8,
  },
  macroTotal: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  confirmButton: {
    backgroundColor: '#e53935',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
}); 