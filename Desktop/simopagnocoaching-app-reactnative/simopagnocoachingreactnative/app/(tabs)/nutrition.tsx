import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { supabaseNutritionService, SupabaseMealPlan, SupabaseMeal, SupabaseFood } from '@/lib/supabaseNutritionService';
import { useAuth } from '@/contexts/AuthContext';

export default function NutritionScreen() {
  const { user } = useAuth();
  const [mealPlan, setMealPlan] = useState<SupabaseMealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadMealPlan();
      // Subscribe to real-time updates
      const subscription = supabaseNutritionService.subscribeToMealPlans(
        user.id,
        user.role as 'coach' | 'client',
        (updatedMealPlan) => {
          setMealPlan(updatedMealPlan);
        },
        (error) => {
          console.error('Nutrition subscription error:', error);
        }
      );

      return () => {
        supabaseNutritionService.unsubscribeFromMealPlans(user.id);
      };
    }
  }, [user]);

  const loadMealPlan = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const mealPlans = await supabaseNutritionService.getMealPlans(
        user.id,
        user.role as 'coach' | 'client'
      );
      
      // Get today's meal plan or the most recent one
      const today = new Date().toISOString().split('T')[0];
      const todayMealPlan = mealPlans.find(mp => mp.date === today);
      const mostRecentMealPlan = mealPlans[0]; // Assuming sorted by date desc
      
      setMealPlan(todayMealPlan || mostRecentMealPlan || null);
    } catch (error) {
      console.error('Error loading meal plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMealPlan();
    setRefreshing(false);
  };

  const toggleFood = async (foodId: string, isCompleted: boolean) => {
    if (!mealPlan) return;
    
    try {
      await supabaseNutritionService.updateFood(foodId, { is_completed: isCompleted });
      // The subscription will automatically update the UI
    } catch (error) {
      console.error('Error updating food:', error);
    }
  };

  const toggleMeal = async (mealId: string) => {
    if (!mealPlan) return;
    
    const meal = mealPlan.meals.find(m => m.id === mealId);
    if (!meal) return;
    
    const allCompleted = meal.foods.every(food => food.is_completed);
    const newCompleted = !allCompleted;
    
    try {
      // Update all foods in the meal
      const updatePromises = meal.foods.map(food =>
        supabaseNutritionService.updateFood(food.id, { is_completed: newCompleted })
      );
      await Promise.all(updatePromises);
      // The subscription will automatically update the UI
    } catch (error) {
      console.error('Error updating meal:', error);
    }
  };

  const resetMealPlan = async () => {
    if (!mealPlan) return;
    
    try {
      // Mark all foods as not completed
      const updatePromises = mealPlan.meals.flatMap(meal =>
        meal.foods.map(food =>
          supabaseNutritionService.updateFood(food.id, { is_completed: false })
        )
      );
      await Promise.all(updatePromises);
      // The subscription will automatically update the UI
    } catch (error) {
      console.error('Error resetting meal plan:', error);
    }
  };

  const calculateMealProgress = (meal: SupabaseMeal) => {
    if (meal.foods.length === 0) return 0;
    const completed = meal.foods.filter(food => food.is_completed).length;
    return (completed / meal.foods.length) * 100;
  };

  const calculateTotalProgress = () => {
    if (!mealPlan) return 0;
    const totalFoods = mealPlan.meals.reduce((sum, meal) => sum + meal.foods.length, 0);
    if (totalFoods === 0) return 0;
    const completedFoods = mealPlan.meals.reduce(
      (sum, meal) => sum + meal.foods.filter(food => food.is_completed).length,
      0
    );
    return (completedFoods / totalFoods) * 100;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <ThemedText style={styles.emptyStateTitle}>Nessun Piano Alimentare</ThemedText>
      <ThemedText style={styles.emptyStateText}>
        Non hai ancora un piano alimentare assegnato per oggi.
      </ThemedText>
    </View>
  );

  const renderMealPlan = () => {
    if (!mealPlan) return renderEmptyState();

    const totalProgress = calculateTotalProgress();

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>{mealPlan.name}</ThemedText>
          <ThemedText style={styles.subtitle}>
            {new Date(mealPlan.date).toLocaleDateString('it-IT', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </ThemedText>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <ThemedText style={styles.progressTitle}>Progresso Totale</ThemedText>
            <ThemedText style={styles.progressPercentage}>
              {Math.round(totalProgress)}%
            </ThemedText>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${totalProgress}%` }]} />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{Math.round(mealPlan.total_calories)}</ThemedText>
            <ThemedText style={styles.statLabel}>Calorie</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{Math.round(mealPlan.total_protein)}g</ThemedText>
            <ThemedText style={styles.statLabel}>Proteine</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{Math.round(mealPlan.total_carbs)}g</ThemedText>
            <ThemedText style={styles.statLabel}>Carboidrati</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{Math.round(mealPlan.total_fat)}g</ThemedText>
            <ThemedText style={styles.statLabel}>Grassi</ThemedText>
          </View>
        </View>

        <View style={styles.mealsContainer}>
          {mealPlan.meals.map((meal) => (
            <View key={meal.id} style={styles.mealCard}>
              <TouchableOpacity
                style={styles.mealHeader}
                onPress={() => toggleMeal(meal.id)}
              >
                <View style={styles.mealInfo}>
                  <ThemedText style={styles.mealName}>{meal.name}</ThemedText>
                  <ThemedText style={styles.mealTime}>{meal.time}</ThemedText>
                </View>
                <View style={styles.mealProgress}>
                  <ThemedText style={styles.mealProgressText}>
                    {Math.round(calculateMealProgress(meal))}%
                  </ThemedText>
                  <View style={styles.mealProgressBar}>
                    <View
                      style={[
                        styles.mealProgressFill,
                        { width: `${calculateMealProgress(meal)}%` }
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.foodsList}>
                {meal.foods.map((food) => (
                  <TouchableOpacity
                    key={food.id}
                    style={styles.foodItem}
                    onPress={() => toggleFood(food.id, !food.is_completed)}
                  >
                    <View style={styles.foodCheckbox}>
                      <View
                        style={[
                          styles.checkbox,
                          food.is_completed && styles.checkboxChecked
                        ]}
                      >
                        {food.is_completed && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.foodInfo}>
                      <ThemedText style={[
                        styles.foodName,
                        food.is_completed && styles.foodNameCompleted
                      ]}>
                        {food.name}
                      </ThemedText>
                      <ThemedText style={styles.foodDetails}>
                        {food.quantity}g • {food.calories} cal • P: {food.protein}g • C: {food.carbs}g • G: {food.fat}g
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetMealPlan}>
          <ThemedText style={styles.resetButtonText}>Reset Piano</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Caricamento piano alimentare...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderMealPlan()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  mealsContainer: {
    marginBottom: 24,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  mealTime: {
    fontSize: 14,
    color: '#666',
  },
  mealProgress: {
    alignItems: 'flex-end',
  },
  mealProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  mealProgressBar: {
    width: 60,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },
  mealProgressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  foodsList: {
    gap: 12,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  foodCheckbox: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  foodNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  foodDetails: {
    fontSize: 12,
    color: '#666',
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
