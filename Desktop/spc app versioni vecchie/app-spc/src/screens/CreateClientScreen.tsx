import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { Colors } from '../constants/colors';
import { AuthService } from '../services/auth';
import { CreateClientRequest } from '../types';

interface CreateClientScreenProps {
  navigation: any;
}

export default function CreateClientScreen({ navigation }: CreateClientScreenProps) {
  const [formData, setFormData] = useState<CreateClientRequest>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    has_nutrition_plan: false,
    subscription_type: 'basic',
    goals: [],
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [currentGoal, setCurrentGoal] = useState('');

  const handleInputChange = (field: keyof CreateClientRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addGoal = () => {
    if (currentGoal.trim()) {
      setFormData(prev => ({
        ...prev,
        goals: [...(prev.goals || []), currentGoal.trim()]
      }));
      setCurrentGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals?.filter((_, i) => i !== index) || []
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.email.trim()) return 'Email è richiesta';
    if (!formData.password.trim()) return 'Password è richiesta';
    if (!formData.first_name.trim()) return 'Nome è richiesto';
    if (!formData.last_name.trim()) return 'Cognome è richiesto';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Formato email non valido';
    }
    
    // Password validation
    if (formData.password.length < 6) {
      return 'La password deve essere di almeno 6 caratteri';
    }
    
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Errore', validationError);
      return;
    }

    setLoading(true);
    try {
      console.log('Creating client with data:', {
        ...formData,
        password: '***hidden***'
      });
      
      const response = await AuthService.createClient(formData);
      
      if (response.success) {
        Alert.alert(
          'Success!', 
          `Cliente ${formData.first_name} ${formData.last_name} creato con successo! Un'email con le credenziali è stata inviata a ${formData.email}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Errore', response.error || 'Errore durante la creazione del cliente');
      }
    } catch (error: any) {
      console.error('Create client error:', error);
      Alert.alert('Errore', error.message || 'Errore durante la creazione del cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Indietro</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuovo Cliente</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informazioni Personali</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Nome cliente"
              placeholderTextColor={Colors.textTertiary}
              value={formData.first_name}
              onChangeText={(value) => handleInputChange('first_name', value)}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cognome *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Cognome cliente"
              placeholderTextColor={Colors.textTertiary}
              value={formData.last_name}
              onChangeText={(value) => handleInputChange('last_name', value)}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="cliente@email.com"
              placeholderTextColor={Colors.textTertiary}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password Temporanea *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Password minimo 6 caratteri"
              placeholderTextColor={Colors.textTertiary}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
            />
            <Text style={styles.inputHint}>
              Il cliente potrà cambiarla al primo accesso
            </Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefono (opzionale)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="+39 123 456 7890"
              placeholderTextColor={Colors.textTertiary}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Subscription Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Piano Abbonamento</Text>
          
          <View style={styles.subscriptionOptions}>
            <TouchableOpacity
              style={[
                styles.subscriptionCard,
                formData.subscription_type === 'basic' && styles.subscriptionCardActive
              ]}
              onPress={() => handleInputChange('subscription_type', 'basic')}
            >
              <View style={styles.subscriptionHeader}>
                <Text style={styles.subscriptionTitle}>Basic</Text>
                <View style={[
                  styles.subscriptionRadio,
                  formData.subscription_type === 'basic' && styles.subscriptionRadioActive
                ]} />
              </View>
              <Text style={styles.subscriptionFeature}>• Programmi allenamento</Text>
              <Text style={styles.subscriptionFeature}>• Chat con coach</Text>
              <Text style={styles.subscriptionFeature}>• Tracking progressi</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.subscriptionCard,
                formData.subscription_type === 'premium' && styles.subscriptionCardActive
              ]}
              onPress={() => handleInputChange('subscription_type', 'premium')}
            >
              <View style={styles.subscriptionHeader}>
                <Text style={styles.subscriptionTitle}>Premium</Text>
                <View style={[
                  styles.subscriptionRadio,
                  formData.subscription_type === 'premium' && styles.subscriptionRadioActive
                ]} />
              </View>
              <Text style={styles.subscriptionFeature}>• Tutto di Basic</Text>
              <Text style={styles.subscriptionFeature}>• Piani nutrizionali</Text>
              <Text style={styles.subscriptionFeature}>• Scansione cibo AI</Text>
              <Text style={styles.subscriptionFeature}>• Analisi dettagliate</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.nutritionOption}>
            <View style={styles.switchRow}>
              <View style={styles.switchContent}>
                <Text style={styles.switchTitle}>Piano Nutrizionale</Text>
                <Text style={styles.switchSubtitle}>
                  Abilita funzionalità nutrizionali per questo cliente
                </Text>
              </View>
              <Switch
                value={formData.has_nutrition_plan}
                onValueChange={(value) => handleInputChange('has_nutrition_plan', value)}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={formData.has_nutrition_plan ? Colors.text : Colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Obiettivi Cliente</Text>
          
          <View style={styles.goalInputContainer}>
            <TextInput
              style={styles.goalInput}
              placeholder="Aggiungi un obiettivo..."
              placeholderTextColor={Colors.textTertiary}
              value={currentGoal}
              onChangeText={setCurrentGoal}
            />
            <TouchableOpacity
              style={styles.addGoalButton}
              onPress={addGoal}
              disabled={!currentGoal.trim()}
            >
              <Text style={styles.addGoalButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          
          {formData.goals && formData.goals.length > 0 && (
            <View style={styles.goalsList}>
              {formData.goals.map((goal, index) => (
                <View key={index} style={styles.goalItem}>
                  <Text style={styles.goalText}>{goal}</Text>
                  <TouchableOpacity
                    style={styles.removeGoalButton}
                    onPress={() => removeGoal(index)}
                  >
                    <Text style={styles.removeGoalButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Note (opzionale)</Text>
          
          <TextInput
            style={styles.textArea}
            placeholder="Note aggiuntive sul cliente..."
            placeholderTextColor={Colors.textTertiary}
            value={formData.notes}
            onChangeText={(value) => handleInputChange('notes', value)}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Creando Cliente...' : 'Crea Cliente'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.submitNote}>
            Il cliente riceverà un'email con le credenziali di accesso
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 100,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  subscriptionOptions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  subscriptionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  subscriptionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundSecondary,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  subscriptionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  subscriptionRadioActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  subscriptionFeature: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  nutritionOption: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchContent: {
    flex: 1,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  switchSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  goalInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  goalInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 12,
  },
  addGoalButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGoalButtonText: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  goalsList: {
    gap: 8,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  removeGoalButton: {
    marginLeft: 8,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeGoalButtonText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '700',
  },
  submitSection: {
    padding: 24,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  submitNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 40,
  },
});