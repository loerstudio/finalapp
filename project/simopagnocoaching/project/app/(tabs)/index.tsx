import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Calendar } from 'lucide-react-native';
import MacroRing from '@/components/MacroRing';
import MealCard from '@/components/MealCard';
import { DailyTracker, UserProfile } from '@/types/food';
import { getDailyTracker, getUserProfile } from '@/utils/storage';
import { formatDate, formatDisplayDate } from '@/utils/dateUtils';

export default function HomeScreen() {
  const router = useRouter();
  const [dailyTracker, setDailyTracker] = useState<DailyTracker | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadData = async () => {
    try {
      const profile = await getUserProfile();
      const today = formatDate(selectedDate);
      const tracker = await getDailyTracker(today);
      
      setUserProfile(profile);
      setDailyTracker(tracker);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const currentNutrition = dailyTracker?.totalNutrition || {
    calories: 0,
    protein: 0,
    sugar: 0,
    fat: 0,
  };

  const goals = userProfile?.goals || {
    calories: 2000,
    protein: 150,
    sugar: 50,
    fat: 65,
  };

  const todaysMeals = dailyTracker?.meals || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Good {getGreeting()}, {userProfile?.name || 'there'}!
            </Text>
            <Text style={styles.date}>{formatDisplayDate(formatDate(selectedDate))}</Text>
          </View>
          <TouchableOpacity style={styles.calendarButton}>
            <Calendar size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Macro Rings */}
        <View style={styles.macroContainer}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.macroGrid}>
            <MacroRing
              label="Calories"
              current={currentNutrition.calories}
              target={goals.calories}
              color="#F59E0B"
              size={90}
            />
            <MacroRing
              label="Protein"
              current={currentNutrition.protein}
              target={goals.protein}
              color="#EF4444"
              size={90}
            />
            <MacroRing
              label="Sugar"
              current={currentNutrition.sugar}
              target={goals.sugar}
              color="#8B5CF6"
              size={90}
            />
            <MacroRing
              label="Fat"
              current={currentNutrition.fat}
              target={goals.fat}
              color="#06B6D4"
              size={90}
            />
          </View>
        </View>

        {/* Quick Add */}
        <View style={styles.quickAddContainer}>
          <TouchableOpacity 
            style={styles.quickAddButton}
            onPress={() => router.push('/camera')}
          >
            <Plus size={24} color="#FFFFFF" />
            <Text style={styles.quickAddText}>Scan Food</Text>
          </TouchableOpacity>
        </View>

        {/* Meals */}
        <View style={styles.mealsContainer}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          {todaysMeals.length > 0 ? (
            todaysMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No meals tracked yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Tap "Scan Food" to get started!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  date: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  calendarButton: {
    padding: 8,
  },
  macroContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickAddContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  quickAddText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  mealsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
});