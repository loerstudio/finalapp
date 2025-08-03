import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/colors';
import { NutritionPlanService } from '../services/nutritionPlan';
import { NutritionService } from '../services/nutrition';
import { NutritionPlan } from '../types';

interface NutritionPlanScreenProps {
  navigation: any;
}

export default function NutritionPlanScreen({ navigation }: NutritionPlanScreenProps) {
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

  const calculatePlanNutrition = (plan: NutritionPlan) => {
    return NutritionPlanService.calculatePlanNutrition(plan);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Caricamento piano nutrizionale...</Text>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today's Summary */}
        {nutritionSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Oggi - {nutritionSummary.date}</Text>
            
            <View style={styles.summaryCard}>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{nutritionSummary.totals.calories}</Text>
                  <Text style={styles.nutritionLabel}>kcal</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{nutritionSummary.totals.protein}g</Text>
                  <Text style={styles.nutritionLabel}>Proteine</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{nutritionSummary.totals.carbs}g</Text>
                  <Text style={styles.nutritionLabel}>Carboidrati</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{nutritionSummary.totals.fats}g</Text>
                  <Text style={styles.nutritionLabel}>Grassi</Text>
                </View>
              </View>
              
              {/* Today's meals */}
              <View style={styles.mealsContainer}>
                {Object.entries(nutritionSummary.meals).map(([mealType, meals]: [string, any[]]) => (
                  <View key={mealType} style={styles.mealSection}>
                    <View style={styles.mealHeader}>
                      <Text style={styles.mealTitle}>{formatMealType(mealType)}</Text>
                      <Text style={styles.mealCount}>{meals.length} cibi</Text>
                    </View>
                    {meals.length === 0 ? (
                      <Text style={styles.emptyMealText}>Nessun cibo registrato</Text>
                    ) : (
                      meals.slice(0, 2).map((meal, index) => (
                        <View key={index} style={styles.mealItem}>
                          <Text style={styles.mealItemName}>{meal.food?.name}</Text>
                          <Text style={styles.mealItemQuantity}>{meal.quantity_grams}g</Text>
                        </View>
                      ))
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Active Nutrition Plan */}
        {activePlan ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Piano Attivo</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('NutritionPlanDetail', { planId: activePlan.id })}
              >
                <Text style={styles.seeMoreText}>Vedi Dettagli</Text>
              </TouchableOpacity>
            </View>

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

              {/* Plan targets */}
              <View style={styles.planTargets}>
                <Text style={styles.targetsTitle}>Obiettivi Giornalieri:</Text>
                <View style={styles.targetGrid}>
                  <View style={styles.targetItem}>
                    <Text style={styles.targetValue}>{activePlan.target_calories}</Text>
                    <Text style={styles.targetLabel}>kcal</Text>
                  </View>
                  <View style={styles.targetItem}>
                    <Text style={styles.targetValue}>{activePlan.target_protein}g</Text>
                    <Text style={styles.targetLabel}>Proteine</Text>
                  </View>
                  <View style={styles.targetItem}>
                    <Text style={styles.targetValue}>{activePlan.target_carbs}g</Text>
                    <Text style={styles.targetLabel}>Carboidrati</Text>
                  </View>
                  <View style={styles.targetItem}>
                    <Text style={styles.targetValue}>{activePlan.target_fats}g</Text>
                    <Text style={styles.targetLabel}>Grassi</Text>
                  </View>
                </View>
              </View>

              {/* Plan days preview */}
              {activePlan.nutrition_plan_days && activePlan.nutrition_plan_days.length > 0 && (
                <View style={styles.planDays}>
                  <Text style={styles.daysTitle}>
                    Piano per {activePlan.nutrition_plan_days.length} giorni
                  </Text>
                  {activePlan.nutrition_plan_days.slice(0, 3).map((day, index) => (
                    <View key={day.id} style={styles.dayPreview}>
                      <Text style={styles.dayTitle}>Giorno {day.day_number}: {day.title}</Text>
                      <Text style={styles.dayMeals}>
                        {day.nutrition_plan_meals?.length || 0} pasti programmati
                      </Text>
                    </View>
                  ))}
                  {activePlan.nutrition_plan_days.length > 3 && (
                    <Text style={styles.moreDaysText}>
                      +{activePlan.nutrition_plan_days.length - 3} altri giorni...
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Piano Nutrizionale</Text>
            <View style={styles.noPlanCard}>
              <Text style={styles.noPlanIcon}>🍎</Text>
              <Text style={styles.noPlanTitle}>Nessun Piano Attivo</Text>
              <Text style={styles.noPlanDescription}>
                Il tuo coach non ha ancora creato un piano nutrizionale per te.
              </Text>
              <Text style={styles.noPlanHint}>
                Nel frattempo puoi scansionare i tuoi cibi per tenere traccia della tua alimentazione.
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Azioni Rapide</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('FoodScan')}
            >
              <Text style={styles.actionIcon}>📷</Text>
              <Text style={styles.actionTitle}>Scansiona Cibo</Text>
              <Text style={styles.actionSubtitle}>AI Gemini</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('FoodDiary')}
            >
              <Text style={styles.actionIcon}>📖</Text>
              <Text style={styles.actionTitle}>Diario Alimentare</Text>
              <Text style={styles.actionSubtitle}>Storico completo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('NutritionStats')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>Statistiche</Text>
              <Text style={styles.actionSubtitle}>Grafici nutrizione</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('FoodSearch')}
            >
              <Text style={styles.actionIcon}>🔍</Text>
              <Text style={styles.actionTitle}>Cerca Cibo</Text>
              <Text style={styles.actionSubtitle}>Database cibi</Text>
            </TouchableOpacity>
          </View>
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
  content: {
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
    margin: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  seeMoreText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  mealsContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  mealSection: {
    marginBottom: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  mealCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyMealText: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  mealItemName: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  mealItemQuantity: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 18,
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
    marginBottom: 16,
  },
  planTargets: {
    marginBottom: 16,
  },
  targetsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  targetGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
  },
  targetItem: {
    alignItems: 'center',
  },
  targetValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  targetLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  planDays: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  daysTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  dayPreview: {
    marginBottom: 8,
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  dayMeals: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  moreDaysText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  noPlanCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noPlanIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noPlanTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  noPlanDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  noPlanHint: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});