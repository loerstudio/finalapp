import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { Calendar, TrendingUp, Award } from 'lucide-react-native';
import MealCard from '@/components/MealCard';
import { DailyTracker } from '@/types/food';
import { getAllDailyTrackers } from '@/utils/storage';
import { formatDisplayDate } from '@/utils/dateUtils';

export default function HistoryScreen() {
  const [trackers, setTrackers] = useState<DailyTracker[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');

  const loadHistory = async () => {
    try {
      const allTrackers = await getAllDailyTrackers();
      setTrackers(allTrackers);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const getWeeklyStats = () => {
    const weekTrackers = trackers.slice(0, 7);
    if (weekTrackers.length === 0) return null;

    const totalCalories = weekTrackers.reduce((sum, tracker) => sum + tracker.totalNutrition.calories, 0);
    const avgCalories = totalCalories / weekTrackers.length;
    const daysTracked = weekTrackers.filter(tracker => tracker.meals.length > 0).length;

    return {
      avgCalories: Math.round(avgCalories),
      daysTracked,
      totalMeals: weekTrackers.reduce((sum, tracker) => sum + tracker.meals.length, 0),
    };
  };

  const weeklyStats = getWeeklyStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
          <TouchableOpacity style={styles.calendarButton}>
            <Calendar size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'week' && styles.periodButtonTextActive,
              ]}
            >
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === 'month' && styles.periodButtonTextActive,
              ]}
            >
              This Month
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Stats */}
        {weeklyStats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Weekly Summary</Text>
            <View style={styles.statsGrid}>
              <StatCard
                icon={TrendingUp}
                label="Avg Calories"
                value={weeklyStats.avgCalories.toString()}
                color="#F59E0B"
              />
              <StatCard
                icon={Calendar}
                label="Days Tracked"
                value={`${weeklyStats.daysTracked}/7`}
                color="#10B981"
              />
              <StatCard
                icon={Award}
                label="Total Meals"
                value={weeklyStats.totalMeals.toString()}
                color="#8B5CF6"
              />
            </View>
          </View>
        )}

        {/* Daily History */}
        <View style={styles.historyContainer}>
          <Text style={styles.sectionTitle}>Daily History</Text>
          {trackers.length > 0 ? (
            trackers.map((tracker) => (
              <DayCard key={tracker.date} tracker={tracker} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No history yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Start tracking your meals to see your history here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <View style={styles.statCard}>
      <Icon size={24} color={color} strokeWidth={2} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DayCard({ tracker }: { tracker: DailyTracker }) {
  const [expanded, setExpanded] = useState(false);

  const caloriesPercent = Math.round((tracker.totalNutrition.calories / tracker.goals.calories) * 100);

  return (
    <View style={styles.dayCard}>
      <TouchableOpacity
        style={styles.dayHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.dayInfo}>
          <Text style={styles.dayDate}>{formatDisplayDate(tracker.date)}</Text>
          <Text style={styles.dayMeals}>{tracker.meals.length} meals tracked</Text>
        </View>
        <View style={styles.dayStats}>
          <Text style={styles.dayCalories}>
            {Math.round(tracker.totalNutrition.calories)} cal
          </Text>
          <Text style={[styles.dayPercent, { color: caloriesPercent > 100 ? '#EF4444' : '#10B981' }]}>
            {caloriesPercent}% of goal
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && tracker.meals.length > 0 && (
        <View style={styles.dayMeals}>
          {tracker.meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </View>
      )}
    </View>
  );
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
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  calendarButton: {
    padding: 8,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  periodButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  historyContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  dayInfo: {
    flex: 1,
  },
  dayDate: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  dayMeals: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dayStats: {
    alignItems: 'flex-end',
  },
  dayCalories: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  dayPercent: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
});