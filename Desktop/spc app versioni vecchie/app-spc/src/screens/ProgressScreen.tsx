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
import { ProgressService } from '../services/progress';
import { ProgressGoal, BodyMetrics } from '../types';

interface ProgressScreenProps {
  navigation: any;
}

export default function ProgressScreen({ navigation }: ProgressScreenProps) {
  const [goals, setGoals] = useState<ProgressGoal[]>([]);
  const [recentMetrics, setRecentMetrics] = useState<BodyMetrics[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);

      // Load goals
      const goalsResponse = await ProgressService.getUserGoals();
      if (goalsResponse.success && goalsResponse.data) {
        setGoals(goalsResponse.data);
      }

      // Load recent metrics
      const metricsResponse = await ProgressService.getBodyMetricsHistory(undefined, 5);
      if (metricsResponse.success && metricsResponse.data) {
        setRecentMetrics(metricsResponse.data);
      }

      // Load summary
      const summaryResponse = await ProgressService.getProgressSummary();
      if (summaryResponse.success && summaryResponse.data) {
        setSummary(summaryResponse.data);
      }

    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore nel caricamento dei progressi');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  const getGoalStatusColor = (goal: ProgressGoal) => {
    if (goal.is_achieved) return Colors.success;
    
    const progress = goal.current_value / goal.target_value;
    if (progress >= 0.8) return Colors.warning;
    if (progress >= 0.5) return Colors.primary;
    return Colors.textSecondary;
  };

  const calculateProgress = (goal: ProgressGoal) => {
    if (goal.goal_type === 'weight_loss') {
      const totalToLose = goal.start_value - goal.target_value;
      const lostSoFar = goal.start_value - goal.current_value;
      return Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100));
    } else {
      return Math.min(100, Math.max(0, (goal.current_value / goal.target_value) * 100));
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Caricamento progressi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>I Tuoi Progressi</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateGoal')}
        >
          <Text style={styles.addButtonText}>+ Obiettivo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Summary Stats */}
        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Riepilogo</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{summary.goals.total}</Text>
                  <Text style={styles.summaryLabel}>Obiettivi Totali</Text>
                </View>
                
                <View style={styles.summaryDivider} />
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{summary.goals.achieved}</Text>
                  <Text style={styles.summaryLabel}>Raggiunti</Text>
                </View>
                
                <View style={styles.summaryDivider} />
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{summary.goals.active}</Text>
                  <Text style={styles.summaryLabel}>Attivi</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Body Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metriche Corporee</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricIcon}>⚖️</Text>
              <Text style={styles.metricValue}>
                {summary?.body_metrics?.current_weight ? `${summary.body_metrics.current_weight} kg` : 'N/A'}
              </Text>
              <Text style={styles.metricLabel}>Peso Attuale</Text>
              {summary?.body_metrics?.weight_change && (
                <Text style={[
                  styles.metricChange,
                  { color: summary.body_metrics.weight_change > 0 ? Colors.error : Colors.success }
                ]}>
                  {summary.body_metrics.weight_change > 0 ? '+' : ''}{summary.body_metrics.weight_change.toFixed(1)} kg
                </Text>
              )}
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricIcon}>📏</Text>
              <Text style={styles.metricValue}>
                {summary?.body_metrics?.recent_bmi ? summary.body_metrics.recent_bmi.toFixed(1) : 'N/A'}
              </Text>
              <Text style={styles.metricLabel}>BMI</Text>
              <Text style={styles.metricChange}>
                {summary?.body_metrics?.recent_bmi 
                  ? summary.body_metrics.recent_bmi < 18.5 
                    ? 'Sottopeso' 
                    : summary.body_metrics.recent_bmi < 25 
                      ? 'Normale' 
                      : 'Sovrappeso'
                  : 'N/A'
                }
              </Text>
            </View>
            
            <TouchableOpacity style={styles.metricCard} onPress={() => navigation.navigate('RecordMetrics')}>
              <Text style={styles.metricIcon}>📏</Text>
              <Text style={styles.metricValue}>+</Text>
              <Text style={styles.metricLabel}>Registra Misure</Text>
              <Text style={styles.metricChange}>Tocca per aggiungere</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.metricCard} onPress={() => navigation.navigate('ProgressPhotos')}>
              <Text style={styles.metricIcon}>📸</Text>
              <Text style={styles.metricValue}>+</Text>
              <Text style={styles.metricLabel}>Foto Progresso</Text>
              <Text style={styles.metricChange}>Prima/dopo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Goals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Obiettivi Attivi</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GoalsList')}>
              <Text style={styles.seeAllText}>Vedi Tutti</Text>
            </TouchableOpacity>
          </View>

          {goals.filter(goal => !goal.is_achieved).slice(0, 3).map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={styles.goalCard}
              onPress={() => navigation.navigate('GoalDetail', { goalId: goal.id })}
            >
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <View style={[styles.goalStatus, { backgroundColor: getGoalStatusColor(goal) }]}>
                  <Text style={styles.goalStatusText}>Attivo</Text>
                </View>
              </View>
              
              <Text style={styles.goalDescription}>{goal.description}</Text>
              
              <View style={styles.goalProgress}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>
                    {goal.current_value} / {goal.target_value} {goal.unit}
                  </Text>
                  <Text style={styles.progressPercentage}>
                    {Math.round(calculateProgress(goal))}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${calculateProgress(goal)}%`,
                        backgroundColor: getGoalStatusColor(goal)
                      }
                    ]} 
                  />
                </View>
              </View>
              
              <Text style={styles.goalTarget}>
                Target: {formatDate(goal.target_date)}
              </Text>
            </TouchableOpacity>
          ))}

          {goals.filter(goal => !goal.is_achieved).length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nessun obiettivo attivo</Text>
              <TouchableOpacity
                style={styles.createFirstGoalButton}
                onPress={() => navigation.navigate('CreateGoal')}
              >
                <Text style={styles.createFirstGoalText}>Crea il tuo primo obiettivo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent Achievements */}
        {goals.filter(goal => goal.is_achieved).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Obiettivi Raggiunti</Text>
            
            <View style={styles.achievementCard}>
              {goals.filter(goal => goal.is_achieved).slice(0, 3).map((goal, index) => (
                <View key={goal.id}>
                  {index > 0 && <View style={styles.achievementDivider} />}
                  <View style={styles.achievementItem}>
                    <View style={styles.achievementIcon}>
                      <Text style={styles.achievementEmoji}>🏆</Text>
                    </View>
                    <View style={styles.achievementContent}>
                      <Text style={styles.achievementTitle}>{goal.title}</Text>
                      <Text style={styles.achievementDescription}>{goal.description}</Text>
                      <Text style={styles.achievementDate}>{formatDate(goal.updated_at)}</Text>
                    </View>
                    <View style={styles.achievementBadge}>
                      <Text style={styles.achievementBadgeText}>FATTO</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Azioni Rapide</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('CreateGoal')}
            >
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionTitle}>Nuovo Obiettivo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('RecordMetrics')}
            >
              <Text style={styles.actionIcon}>📏</Text>
              <Text style={styles.actionTitle}>Registra Misure</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ProgressPhotos')}
            >
              <Text style={styles.actionIcon}>📸</Text>
              <Text style={styles.actionTitle}>Foto Progresso</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ProgressCharts')}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionTitle}>Grafici</Text>
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
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    marginTop: 24,
  },
  seeAllText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 12,
    color: Colors.success,
    textAlign: 'center',
  },
  goalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  goalStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text,
  },
  goalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  goalProgress: {
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalTarget: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  createFirstGoalButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstGoalText: {
    color: Colors.text,
    fontWeight: '600',
  },
  achievementCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementEmoji: {
    fontSize: 20,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  achievementDate: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  achievementBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  achievementBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text,
  },
  achievementDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
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
  bottomPadding: {
    height: 40,
  },
});