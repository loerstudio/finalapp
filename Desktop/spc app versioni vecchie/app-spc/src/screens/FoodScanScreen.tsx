import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { Colors } from '../constants/colors';
import { NutritionService } from '../services/nutrition';
import GeminiService from '../services/gemini';
import { FoodScanResult, NutritionFood } from '../types';
import * as ImagePicker from 'expo-image-picker';

interface FoodScanScreenProps {
  navigation: any;
}

export default function FoodScanScreen({ navigation }: FoodScanScreenProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<FoodScanResult | null>(null);
  const [createdFood, setCreatedFood] = useState<NutritionFood | null>(null);
  const [quantity, setQuantity] = useState<string>('100');
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [logging, setLogging] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permessi richiesti', 'Hai bisogno dei permessi per accedere alla galleria.');
      return false;
    }

    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus.status !== 'granted') {
      Alert.alert('Permessi richiesti', 'Hai bisogno dei permessi per usare la fotocamera.');
      return false;
    }

    return true;
  };

  const pickImageFromGallery = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setScanResult(null);
        setCreatedFood(null);
      }
    } catch (error: any) {
      Alert.alert('Errore', 'Errore nella selezione dell\'immagine');
    }
  };

  const takePhoto = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
        setScanResult(null);
        setCreatedFood(null);
      }
    } catch (error: any) {
      Alert.alert('Errore', 'Errore nello scatto della foto');
    }
  };

  const scanImage = async () => {
    if (!selectedImage) {
      Alert.alert('Errore', 'Seleziona prima un\'immagine');
      return;
    }

    setScanning(true);
    try {
      console.log('🔍 Starting Gemini food scan...');
      
      // Use Gemini to scan the image
      const geminiResponse = await GeminiService.scanFoodImage(selectedImage);
      
      if (geminiResponse.success && geminiResponse.data) {
        const scanData = geminiResponse.data;
        
        // Check if it's not food
        if (!scanData.isFood) {
          Alert.alert('⚠️ NON È CIBO!', 'L\'immagine non contiene cibo riconoscibile.');
          setScanResult(null);
          setCreatedFood(null);
          return;
        }

        // Convert Gemini result to our FoodScanResult format
        const foodScanResult: FoodScanResult = {
          is_food: true,
          food_name: scanData.foodName || 'Cibo non identificato',
          description: scanData.description || '',
          confidence_score: scanData.confidence,
          nutritional_values: scanData.nutritionalValues || {
            calories_per_100g: 0,
            protein_per_100g: 0,
            carbs_per_100g: 0,
            fats_per_100g: 0
          },
          scan_metadata: {
            api_provider: 'gemini',
            model: 'gemini-1.5-flash',
            timestamp: new Date().toISOString()
          }
        };

        setScanResult(foodScanResult);
        
        // Create food in database using nutritional values from Gemini
        if (scanData.nutritionalValues) {
          const foodData = {
            name: scanData.foodName || 'Cibo scansionato',
            calories_per_100g: scanData.nutritionalValues.calories_per_100g,
            protein_per_100g: scanData.nutritionalValues.protein_per_100g,
            carbs_per_100g: scanData.nutritionalValues.carbs_per_100g,
            fats_per_100g: scanData.nutritionalValues.fats_per_100g,
            fiber_per_100g: scanData.nutritionalValues.fiber_per_100g || 0,
            sugar_per_100g: scanData.nutritionalValues.sugar_per_100g || 0,
            sodium_per_100g: scanData.nutritionalValues.sodium_per_100g || 0,
          };

          const foodResponse = await NutritionService.createFood(foodData);
          if (foodResponse.success && foodResponse.data) {
            setCreatedFood(foodResponse.data);
          }
        }

        // Save scan to history
        try {
          await NutritionService.saveFoodScan(selectedImage, foodScanResult);
        } catch (scanSaveError) {
          console.warn('Failed to save scan to history:', scanSaveError);
        }
        
        Alert.alert(
          '🎉 Cibo Riconosciuto!',
          `${scanData.foodName}\nConfidenza: ${Math.round((scanData.confidence || 0) * 100)}%\n\n${scanData.description || ''}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Errore', geminiResponse.error || 'Errore durante la scansione con AI');
      }
    } catch (error: any) {
      console.error('Scan error:', error);
      Alert.alert('Errore', error.message || 'Errore durante la scansione');
    } finally {
      setScanning(false);
    }
  };

  const logFood = async () => {
    if (!createdFood || !quantity) {
      Alert.alert('Errore', 'Dati insufficienti per registrare il cibo');
      return;
    }

    const quantityGrams = parseFloat(quantity);
    if (isNaN(quantityGrams) || quantityGrams <= 0) {
      Alert.alert('Errore', 'Inserisci una quantità valida in grammi');
      return;
    }

    setLogging(true);
    try {
      const response = await NutritionService.logFood({
        food_id: createdFood.id,
        quantity_grams: quantityGrams,
        meal_type: selectedMealType,
        logged_at: new Date().toISOString()
      });

      if (response.success) {
        Alert.alert(
          'Successo!',
          'Cibo registrato nel diario alimentare',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Errore', response.error || 'Errore nella registrazione');
      }
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore nella registrazione');
    } finally {
      setLogging(false);
    }
  };

  const calculateNutrition = (quantity: number) => {
    if (!createdFood) return null;
    
    const multiplier = quantity / 100;
    return {
      calories: Math.round(createdFood.calories_per_100g * multiplier),
      protein: Math.round(createdFood.protein_per_100g * multiplier * 10) / 10,
      carbs: Math.round(createdFood.carbs_per_100g * multiplier * 10) / 10,
      fats: Math.round(createdFood.fats_per_100g * multiplier * 10) / 10,
    };
  };

  const nutrition = calculateNutrition(parseFloat(quantity) || 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Indietro</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scansiona Cibo</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Seleziona o Scatta Foto</Text>
          
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              <TouchableOpacity 
                style={styles.changeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Text style={styles.changeImageText}>Cambia Immagine</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imageSelector}>
              <TouchableOpacity style={styles.imageOption} onPress={takePhoto}>
                <Text style={styles.imageOptionIcon}>📷</Text>
                <Text style={styles.imageOptionTitle}>Scatta Foto</Text>
                <Text style={styles.imageOptionSubtitle}>Usa la fotocamera</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.imageOption} onPress={pickImageFromGallery}>
                <Text style={styles.imageOptionIcon}>🖼️</Text>
                <Text style={styles.imageOptionTitle}>Dalla Galleria</Text>
                <Text style={styles.imageOptionSubtitle}>Scegli foto esistente</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Scan Button */}
        {selectedImage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Analizza Immagine</Text>
            
            <TouchableOpacity
              style={[styles.scanButton, scanning && styles.scanButtonDisabled]}
              onPress={scanImage}
              disabled={scanning}
            >
              {scanning ? (
                <View style={styles.scanningContainer}>
                  <ActivityIndicator size="small" color={Colors.text} />
                  <Text style={styles.scanButtonText}>Analizzando con AI...</Text>
                </View>
              ) : (
                <Text style={styles.scanButtonText}>🤖 Analizza con Gemini AI</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Scan Results */}
        {scanResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Risultato Scansione</Text>
            
            {scanResult.is_food ? (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultIcon}>✅</Text>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultTitle}>{scanResult.food_name}</Text>
                    <Text style={styles.resultSubtitle}>
                      Confidenza: {scanResult.confidence}%
                    </Text>
                    {scanResult.quantity_estimate && (
                      <Text style={styles.resultQuantity}>
                        Quantità stimata: {scanResult.quantity_estimate}
                      </Text>
                    )}
                  </View>
                </View>
                
                {scanResult.nutrition && (
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{scanResult.nutrition.calories}</Text>
                      <Text style={styles.nutritionLabel}>kcal/100g</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{scanResult.nutrition.protein}g</Text>
                      <Text style={styles.nutritionLabel}>Proteine</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{scanResult.nutrition.carbs}g</Text>
                      <Text style={styles.nutritionLabel}>Carboidrati</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{scanResult.nutrition.fats}g</Text>
                      <Text style={styles.nutritionLabel}>Grassi</Text>
                    </View>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.notFoodCard}>
                <Text style={styles.notFoodIcon}>❌</Text>
                <Text style={styles.notFoodTitle}>NON È CIBO!</Text>
                <Text style={styles.notFoodSubtitle}>
                  L'AI non ha riconosciuto cibo in questa immagine
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Food Logging */}
        {createdFood && scanResult?.is_food && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Registra nel Diario</Text>
            
            <View style={styles.loggingCard}>
              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Quantità (grammi)</Text>
                <TextInput
                  style={styles.quantityInput}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="100"
                />
              </View>
              
              <View style={styles.mealTypeContainer}>
                <Text style={styles.mealTypeLabel}>Tipo Pasto</Text>
                <View style={styles.mealTypeButtons}>
                  {[
                    { key: 'breakfast', label: 'Colazione', icon: '🌅' },
                    { key: 'lunch', label: 'Pranzo', icon: '🌞' },
                    { key: 'dinner', label: 'Cena', icon: '🌙' },
                    { key: 'snack', label: 'Spuntino', icon: '🍎' },
                  ].map((meal) => (
                    <TouchableOpacity
                      key={meal.key}
                      style={[
                        styles.mealTypeButton,
                        selectedMealType === meal.key && styles.mealTypeButtonActive
                      ]}
                      onPress={() => setSelectedMealType(meal.key as any)}
                    >
                      <Text style={styles.mealTypeIcon}>{meal.icon}</Text>
                      <Text style={[
                        styles.mealTypeText,
                        selectedMealType === meal.key && styles.mealTypeTextActive
                      ]}>
                        {meal.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              {nutrition && (
                <View style={styles.calculatedNutrition}>
                  <Text style={styles.calculatedTitle}>
                    Valori per {quantity}g:
                  </Text>
                  <View style={styles.calculatedGrid}>
                    <View style={styles.calculatedItem}>
                      <Text style={styles.calculatedValue}>{nutrition.calories}</Text>
                      <Text style={styles.calculatedLabel}>kcal</Text>
                    </View>
                    <View style={styles.calculatedItem}>
                      <Text style={styles.calculatedValue}>{nutrition.protein}g</Text>
                      <Text style={styles.calculatedLabel}>Proteine</Text>
                    </View>
                    <View style={styles.calculatedItem}>
                      <Text style={styles.calculatedValue}>{nutrition.carbs}g</Text>
                      <Text style={styles.calculatedLabel}>Carboidrati</Text>
                    </View>
                    <View style={styles.calculatedItem}>
                      <Text style={styles.calculatedValue}>{nutrition.fats}g</Text>
                      <Text style={styles.calculatedLabel}>Grassi</Text>
                    </View>
                  </View>
                </View>
              )}
              
              <TouchableOpacity
                style={[styles.logButton, logging && styles.logButtonDisabled]}
                onPress={logFood}
                disabled={logging}
              >
                {logging ? (
                  <ActivityIndicator size="small" color={Colors.text} />
                ) : (
                  <Text style={styles.logButtonText}>📝 Aggiungi al Diario</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

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
  imageContainer: {
    alignItems: 'center',
  },
  selectedImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
  },
  changeImageButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  changeImageText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  imageSelector: {
    flexDirection: 'row',
    gap: 16,
  },
  imageOption: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageOptionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  imageOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  imageOptionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  scanButtonDisabled: {
    opacity: 0.6,
  },
  scanningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scanButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  resultQuantity: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  notFoodCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  notFoodIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  notFoodTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.error,
    marginBottom: 8,
  },
  notFoodSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  loggingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  quantityInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealTypeContainer: {
    marginBottom: 20,
  },
  mealTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealTypeButton: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealTypeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  mealTypeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  mealTypeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  mealTypeTextActive: {
    color: Colors.text,
  },
  calculatedNutrition: {
    marginBottom: 20,
  },
  calculatedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  calculatedGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
  },
  calculatedItem: {
    alignItems: 'center',
  },
  calculatedValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  calculatedLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  logButton: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logButtonDisabled: {
    opacity: 0.6,
  },
  logButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 40,
  },
});