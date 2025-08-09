import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Camera, RotateCcw, X, Check, Plus } from 'lucide-react-native';
import { analyzeFood } from '@/services/deepseekApi';
import { addMealToDay, getUserProfile } from '@/utils/storage';
import { FoodItem, Meal } from '@/types/food';
import { formatDate } from '@/utils/dateUtils';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function CameraScreen() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    // Auto-select meal type based on time of day
    const hour = new Date().getHours();
    if (hour < 11) {
      setSelectedMealType('breakfast');
    } else if (hour < 16) {
      setSelectedMealType('lunch');
    } else if (hour < 20) {
      setSelectedMealType('dinner');
    } else {
      setSelectedMealType('snack');
    }
  }, []);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Camera size={60} color="#10B981" strokeWidth={1.5} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionMessage}>
            We need access to your camera to analyze your food photos
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          setCapturedImage(photo.uri);
          await analyzeFoodImage(photo.uri);
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture. Please try again.');
      }
    }
  };

  const analyzeFoodImage = async (imageUri: string) => {
    setAnalyzing(true);
    try {
      const analyzedFoods = await analyzeFood(imageUri);
      setFoods(analyzedFoods);
    } catch (error) {
      console.error('Error analyzing food:', error);
      Alert.alert('Error', 'Failed to analyze food. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const saveMeal = async () => {
    if (foods.length === 0) return;

    try {
      const totalNutrition = foods.reduce((total, food) => ({
        calories: total.calories + food.nutrition.calories,
        protein: total.protein + food.nutrition.protein,
        sugar: total.sugar + food.nutrition.sugar,
        fat: total.fat + food.nutrition.fat,
      }), {
        calories: 0,
        protein: 0,
        sugar: 0,
        fat: 0,
      });

      const meal: Meal = {
        id: 'meal-' + Date.now(),
        type: selectedMealType,
        timestamp: new Date().toISOString(),
        imageUri: capturedImage || undefined,
        foods,
        totalNutrition,
      };

      const profile = await getUserProfile();
      const today = formatDate(new Date());
      
      await addMealToDay(today, meal, profile?.goals);
      
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to save meal. Please try again.');
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setFoods([]);
    setAnalyzing(false);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={resetCapture}>
            <X size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Food Analysis</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.analysisContainer} showsVerticalScrollIndicator={false}>
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />

          {/* Meal Type Selection */}
          <View style={styles.mealTypeContainer}>
            <Text style={styles.sectionTitle}>Meal Type</Text>
            <View style={styles.mealTypeButtons}>
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.mealTypeButton,
                    selectedMealType === type && styles.mealTypeButtonActive,
                  ]}
                  onPress={() => setSelectedMealType(type)}
                >
                  <Text
                    style={[
                      styles.mealTypeButtonText,
                      selectedMealType === type && styles.mealTypeButtonTextActive,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Analysis Results */}
          {analyzing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.loadingText}>Analyzing your food...</Text>
            </View>
          ) : foods.length > 0 ? (
            <View style={styles.resultsContainer}>
              <Text style={styles.sectionTitle}>Detected Foods</Text>
              {foods.map((food, index) => (
                <FoodItemCard key={food.id} food={food} />
              ))}
              
              <View style={styles.totalNutrition}>
                <Text style={styles.totalTitle}>Total Nutrition</Text>
                <View style={styles.nutritionGrid}>
                  <NutritionTotal 
                    label="Calories" 
                    value={foods.reduce((sum, f) => sum + f.nutrition.calories, 0)}
                    color="#F59E0B"
                  />
                  <NutritionTotal 
                    label="Protein" 
                    value={foods.reduce((sum, f) => sum + f.nutrition.protein, 0)}
                    unit="g"
                    color="#EF4444"
                  />
                  <NutritionTotal 
                    label="Sugar" 
                    value={foods.reduce((sum, f) => sum + f.nutrition.sugar, 0)}
                    unit="g"
                    color="#8B5CF6"
                  />
                  <NutritionTotal 
                    label="Fat" 
                    value={foods.reduce((sum, f) => sum + f.nutrition.fat, 0)}
                    unit="g"
                    color="#06B6D4"
                  />
                </View>
              </View>
            </View>
          ) : null}
        </ScrollView>

        {foods.length > 0 && !analyzing && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveButton} onPress={saveMeal}>
              <Check size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Meal</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <View style={styles.cameraHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.cameraTitle}>Scan Your Food</Text>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <RotateCcw size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.cameraFooter}>
          <View style={styles.captureContainer}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
          </View>
          <Text style={styles.captureHint}>Tap to capture your meal</Text>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

function FoodItemCard({ food }: { food: FoodItem }) {
  return (
    <View style={styles.foodCard}>
      <View style={styles.foodHeader}>
        <Text style={styles.foodName}>{food.name}</Text>
        <Text style={styles.foodQuantity}>{food.quantity}</Text>
      </View>
      <View style={styles.foodNutrition}>
        <Text style={styles.nutritionText}>
          {Math.round(food.nutrition.calories)} cal • {Math.round(food.nutrition.protein)}g protein
        </Text>
        <Text style={styles.confidenceText}>
          {Math.round(food.confidence * 100)}% confidence
        </Text>
      </View>
    </View>
  );
}

function NutritionTotal({ label, value, unit = '', color }: any) {
  return (
    <View style={styles.nutritionItem}>
      <Text style={[styles.nutritionValue, { color }]}>
        {Math.round(value)}{unit}
      </Text>
      <Text style={styles.nutritionLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  permissionMessage: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  camera: {
    flex: 1,
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  cameraTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  flipButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  cameraFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureContainer: {
    marginBottom: 16,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
  },
  captureHint: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  analysisContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  capturedImage: {
    width: '100%',
    height: 240,
    marginBottom: 20,
  },
  mealTypeContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  mealTypeButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  mealTypeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  mealTypeButtonTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 16,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  foodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    flex: 1,
  },
  foodQuantity: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  foodNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutritionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  confidenceText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  totalNutrition: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  totalTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});