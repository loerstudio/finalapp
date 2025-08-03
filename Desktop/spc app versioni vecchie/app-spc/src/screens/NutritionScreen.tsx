import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/colors';
import { NutritionPlanService } from '../services/nutritionPlan';
import { NutritionService } from '../services/nutrition';
import { NutritionPlan } from '../types';

interface NutritionScreenProps {
  navigation: any;
}

export default function NutritionScreen({ navigation }: NutritionScreenProps) {
  const [activePlan, setActivePlan] = useState<NutritionPlan | null>(null);
  const [nutritionSummary, setNutritionSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNutritionData();
  }, []);

  const loadNutritionData = async () => {
    try {
      setLoading(true);

      // Load active nutrition plan
      const planResponse = await NutritionPlanService.getClientNutritionPlan();
      if (planResponse.success && planResponse.data) {
        setActivePlan(planResponse.data);
      }

      // Load today's nutrition summary
      const today = new Date().toISOString().split('T')[0];
      const summaryResponse = await NutritionService.getNutritionalSummary(today);
      if (summaryResponse.success && summaryResponse.data) {
        setNutritionSummary(summaryResponse.data);
      }

    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore nel caricamento dei dati nutrizionali');
    } finally {
      setLoading(false);
    }
  };

  const formatMealType = (mealType: string) => {
    const types: { [key: string]: string } = {
      breakfast: 'Colazione',
      lunch: 'Pranzo', 
      dinner: 'Cena',
      snack: 'Spuntino'
    };
    return types[mealType] || mealType;
  };

  const getMealIcon = (mealType: string) => {
    const icons: { [key: string]: string } = {
      breakfast: '🍳',
      lunch: '🥗',
      dinner: '🍽️',
      snack: '🍎'
    };
    return icons[mealType] || '🍽️';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Caricamento nutrizione...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Piano Nutrizionale</Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('FoodScan')}
        >
          <Text style={styles.scanButtonText}>📷 Scansiona</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Daily Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progresso di Oggi</Text>
          
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <View style={styles.progressItem}>
                <Text style={styles.progressNumber}>
                  {nutritionSummary?.totals?.calories || 0}
                </Text>
                <Text style={styles.progressLabel}>Calorie</Text>
                <Text style={styles.progressTarget}>
                  / {activePlan?.target_calories || '---'}
                </Text>
              </View>
              
              <View style={styles.progressDivider} />
              
              <View style={styles.progressItem}>
                <Text style={styles.progressNumber}>
                  {nutritionSummary?.totals?.protein || 0}g
                </Text>
                <Text style={styles.progressLabel}>Proteine</Text>
                <Text style={styles.progressTarget}>
                  / {activePlan?.target_protein || '---'}g
                </Text>
              </View>
              
              <View style={styles.progressDivider} />
              
              <View style={styles.progressItem}>
                <Text style={styles.progressNumber}>
                  {nutritionSummary?.totals?.carbs || 0}g
                </Text>
                <Text style={styles.progressLabel}>Carboidrati</Text>
                <Text style={styles.progressTarget}>
                  / {activePlan?.target_carbs || '---'}g
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Azioni Rapide</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('FoodScan')}
            >
              <Text style={styles.actionIcon}>📷</Text>
              <Text style={styles.actionTitle}>Scansiona Cibo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('FoodSearch')}
            >
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionTitle}>Cerca Cibo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('FoodDiary')}
            >
              <Text style={styles.actionIcon}>📖</Text>
              <Text style={styles.actionTitle}>Diario Alimentare</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('NutritionStats')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>Statistiche</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Meals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pasti di Oggi</Text>
          
          <View style={styles.mealCard}>
            {nutritionSummary && Object.entries(nutritionSummary.meals).map(([mealType, meals]: [string, any[]]) => (
              <View key={mealType}>
                <View style={styles.mealTypeHeader}>
                  <Text style={styles.mealTypeTitle}>{formatMealType(mealType)}</Text>
                  <Text style={styles.mealTypeCount}>{meals.length} cibi</Text>
                </View>
                
                {meals.length === 0 ? (
                  <View style={styles.emptyMeal}>
                    <Text style={styles.emptyMealIcon}>{getMealIcon(mealType)}</Text>
                    <Text style={styles.emptyMealText}>Nessun cibo registrato</Text>
                    <TouchableOpacity 
                      style={styles.addMealButton}
                      onPress={() => navigation.navigate('FoodScan')}
                    >
                      <Text style={styles.addMealButtonText}>+ Aggiungi</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  meals.map((meal, index) => (
                    <View key={index} style={styles.mealItem}>
                      <View style={styles.mealIcon}>
                        <Text style={styles.mealEmoji}>{getMealIcon(mealType)}</Text>
                      </View>
                      <View style={styles.mealContent}>
                        <Text style={styles.mealTitle}>{meal.food?.name}</Text>
                        <Text style={styles.mealDetails}>{meal.quantity_grams}g</Text>
                        <Text style={styles.mealTime}>{formatTime(meal.logged_at)}</Text>
                      </View>
                      <View style={styles.mealCalories}>
                        <Text style={styles.calorieNumber}>
                          {Math.round((meal.food?.calories_per_100g || 0) * meal.quantity_grams / 100)}
                        </Text>
                        <Text style={styles.calorieLabel}>cal</Text>
                      </View>
                    </View>
                  ))
                )}
                
                {mealType !== 'snack' && <View style={styles.mealDivider} />}
              </View>
            ))}

            {!nutritionSummary && (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataIcon}>🍽️</Text>
                <Text style={styles.noDataTitle}>Nessun Cibo Registrato</Text>
                <Text style={styles.noDataDescription}>
                  Inizia a tracciare la tua alimentazione scansionando un cibo.
                </Text>
                <TouchableOpacity 
                  style={styles.startTrackingButton}
                  onPress={() => navigation.navigate('FoodScan')}
                >
                  <Text style={styles.startTrackingButtonText}>Inizia a Tracciare</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Active Plan Info */}
        {activePlan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Piano Attivo</Text>
            
            <View style={styles.planCard}>
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>{activePlan.title}</Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ATTIVO</Text>
                </View>
              </View>
              
              {activePlan.description && (
                <Text style={styles.planDescription}>{activePlan.description}</Text>
              )}
              
              <TouchableOpacity 
                style={styles.viewPlanButton}
                onPress={() => navigation.navigate('NutritionPlanDetail', { planId: activePlan.id })}
              >
                <Text style={styles.viewPlanButtonText}>Vedi Piano Completo</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  scanButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scanButtonText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 12,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    marginTop: 24,
  },
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressItem: {
    flex: 1,
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  progressTarget: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  progressDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  mealCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  mealTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  mealTypeCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyMeal: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyMealIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyMealText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  addMealButton: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addMealButtonText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  mealIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealEmoji: {
    fontSize: 18,
  },
  mealContent: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  mealDetails: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 1,
  },
  mealTime: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  mealCalories: {
    alignItems: 'center',
  },
  calorieNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  calorieLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  mealDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  noDataDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  startTrackingButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startTrackingButtonText: {
    color: Colors.text,
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text,
  },
  planDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  viewPlanButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  viewPlanButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  bottomPadding: {
    height: 40,
  },
});