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
import { supabaseProgressService, SupabaseProgressData, SupabaseGoal } from '@/lib/supabaseProgressService';
import { useAuth } from '@/contexts/AuthContext';

export default function ProgressScreen() {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<SupabaseProgressData[]>([]);
  const [goals, setGoals] = useState<SupabaseGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadProgressData();
      loadGoals();
      
      // Subscribe to real-time updates
      const progressSubscription = supabaseProgressService.subscribeToProgress(
        user.id,
        (updatedProgress) => {
          setProgressData(prev => {
            const index = prev.findIndex(p => p.id === updatedProgress.id);
            if (index >= 0) {
              const newData = [...prev];
              newData[index] = updatedProgress;
              return newData;
            } else {
              return [updatedProgress, ...prev];
            }
          });
        },
        (error) => {
          console.error('Progress subscription error:', error);
        }
      );

      const goalsSubscription = supabaseProgressService.subscribeToGoals(
        user.id,
        (updatedGoal) => {
          setGoals(prev => {
            const index = prev.findIndex(g => g.id === updatedGoal.id);
            if (index >= 0) {
              const newGoals = [...prev];
              newGoals[index] = updatedGoal;
              return newGoals;
            } else {
              return [updatedGoal, ...prev];
            }
          });
        },
        (error) => {
          console.error('Goals subscription error:', error);
        }
      );

      return () => {
        supabaseProgressService.unsubscribeFromProgress(user.id);
        supabaseProgressService.unsubscribeFromGoals(user.id);
      };
    }
  }, [user]);

  const loadProgressData = async () => {
    if (!user) return;
    
    try {
      const data = await supabaseProgressService.getProgressData(user.id);
      setProgressData(data);
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const loadGoals = async () => {
    if (!user) return;
    
    try {
      const data = await supabaseProgressService.getGoals(user.id);
      setGoals(data);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadProgressData(), loadGoals()]);
    setRefreshing(false);
  };

  const getLatestProgress = () => {
    if (progressData.length === 0) return null;
    return progressData.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
  };

  const getPreviousProgress = () => {
    if (progressData.length < 2) return null;
    return progressData.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[1];
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const renderProgressCard = () => {
    const latest = getLatestProgress();
    const previous = getPreviousProgress();

    if (!latest) {
      return (
        <View style={styles.emptyCard}>
          <ThemedText style={styles.emptyCardTitle}>Nessun Dato di Progresso</ThemedText>
          <ThemedText style={styles.emptyCardText}>
            Inizia a tracciare i tuoi progressi per vedere i risultati
          </ThemedText>
        </View>
      );
    }

    const weightChange = previous ? calculateChange(latest.weight, previous.weight) : 0;
    const bodyFatChange = previous ? calculateChange(latest.body_fat, previous.body_fat) : 0;

    return (
      <View style={styles.progressCard}>
        <ThemedText style={styles.cardTitle}>Ultimo Aggiornamento</ThemedText>
        <ThemedText style={styles.cardDate}>
          {new Date(latest.date).toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </ThemedText>

        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <ThemedText style={styles.metricValue}>{latest.weight} kg</ThemedText>
            <ThemedText style={styles.metricLabel}>Peso</ThemedText>
            {previous && (
              <ThemedText style={[
                styles.metricChange,
                weightChange > 0 ? styles.positiveChange : styles.negativeChange
              ]}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}%
              </ThemedText>
            )}
          </View>

          <View style={styles.metricItem}>
            <ThemedText style={styles.metricValue}>{latest.body_fat}%</ThemedText>
            <ThemedText style={styles.metricLabel}>Grasso Corporeo</ThemedText>
            {previous && (
              <ThemedText style={[
                styles.metricChange,
                bodyFatChange < 0 ? styles.positiveChange : styles.negativeChange
              ]}>
                {bodyFatChange > 0 ? '+' : ''}{bodyFatChange.toFixed(1)}%
              </ThemedText>
            )}
          </View>

          <View style={styles.metricItem}>
            <ThemedText style={styles.metricValue}>{latest.muscle_mass} kg</ThemedText>
            <ThemedText style={styles.metricLabel}>Massa Muscolare</ThemedText>
          </View>
        </View>

        <View style={styles.measurementsGrid}>
          <View style={styles.measurementItem}>
            <ThemedText style={styles.measurementLabel}>Torace</ThemedText>
            <ThemedText style={styles.measurementValue}>{latest.chest} cm</ThemedText>
          </View>
          <View style={styles.measurementItem}>
            <ThemedText style={styles.measurementLabel}>Vita</ThemedText>
            <ThemedText style={styles.measurementValue}>{latest.waist} cm</ThemedText>
          </View>
          <View style={styles.measurementItem}>
            <ThemedText style={styles.measurementLabel}>Fianchi</ThemedText>
            <ThemedText style={styles.measurementValue}>{latest.hips} cm</ThemedText>
          </View>
          <View style={styles.measurementItem}>
            <ThemedText style={styles.measurementLabel}>Bicipiti</ThemedText>
            <ThemedText style={styles.measurementValue}>{latest.biceps} cm</ThemedText>
          </View>
          <View style={styles.measurementItem}>
            <ThemedText style={styles.measurementLabel}>Cosce</ThemedText>
            <ThemedText style={styles.measurementValue}>{latest.thighs} cm</ThemedText>
          </View>
        </View>

        {latest.notes && (
          <View style={styles.notesSection}>
            <ThemedText style={styles.notesLabel}>Note:</ThemedText>
            <ThemedText style={styles.notesText}>{latest.notes}</ThemedText>
          </View>
        )}
      </View>
    );
  };

  const renderGoalsSection = () => {
    if (goals.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <ThemedText style={styles.emptyCardTitle}>Nessun Obiettivo</ThemedText>
          <ThemedText style={styles.emptyCardText}>
            Crea i tuoi obiettivi per rimanere motivato
          </ThemedText>
        </View>
      );
    }

    const activeGoals = goals.filter(goal => goal.status === 'active');
    const completedGoals = goals.filter(goal => goal.status === 'completed');

    return (
      <View style={styles.goalsSection}>
        <ThemedText style={styles.sectionTitle}>I Tuoi Obiettivi</ThemedText>
        
        {activeGoals.length > 0 && (
          <View style={styles.goalsGroup}>
            <ThemedText style={styles.goalsGroupTitle}>Obiettivi Attivi</ThemedText>
            {activeGoals.map((goal) => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
                  <View style={styles.goalStatus}>
                    <View style={styles.statusBadge}>
                      <ThemedText style={styles.statusText}>Attivo</ThemedText>
                    </View>
                  </View>
                </View>
                
                <ThemedText style={styles.goalDescription}>{goal.description}</ThemedText>
                
                <View style={styles.goalProgress}>
                  <View style={styles.goalProgressHeader}>
                    <ThemedText style={styles.goalProgressText}>
                      {goal.current_value} / {goal.target_value} {goal.unit}
                    </ThemedText>
                    <ThemedText style={styles.goalProgressPercentage}>
                      {Math.round((goal.current_value / goal.target_value) * 100)}%
                    </ThemedText>
                  </View>
                  <View style={styles.goalProgressBar}>
                    <View
                      style={[
                        styles.goalProgressFill,
                        { width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%` }
                      ]}
                    />
                  </View>
                </View>
                
                <ThemedText style={styles.goalTargetDate}>
                  Obiettivo: {new Date(goal.target_date).toLocaleDateString('it-IT')}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {completedGoals.length > 0 && (
          <View style={styles.goalsGroup}>
            <ThemedText style={styles.goalsGroupTitle}>Obiettivi Completati</ThemedText>
            {completedGoals.map((goal) => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
                  <View style={styles.goalStatus}>
                    <View style={[styles.statusBadge, styles.completedBadge]}>
                      <ThemedText style={styles.statusText}>Completato</ThemedText>
                    </View>
                  </View>
                </View>
                
                <ThemedText style={styles.goalDescription}>{goal.description}</ThemedText>
                
                <View style={styles.goalProgress}>
                  <View style={styles.goalProgressHeader}>
                    <ThemedText style={styles.goalProgressText}>
                      {goal.target_value} {goal.unit}
                    </ThemedText>
                    <ThemedText style={styles.goalProgressPercentage}>100%</ThemedText>
                  </View>
                  <View style={styles.goalProgressBar}>
                    <View style={[styles.goalProgressFill, { width: '100%' }]} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Caricamento progressi...</ThemedText>
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
        <View style={styles.container}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Progressi</ThemedText>
            <ThemedText style={styles.subtitle}>
              Traccia i tuoi risultati e raggiungi i tuoi obiettivi
            </ThemedText>
          </View>

          {renderProgressCard()}
          {renderGoalsSection()}
        </View>
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
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyCardText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 10,
    fontWeight: '600',
  },
  positiveChange: {
    color: '#34C759',
  },
  negativeChange: {
    color: '#FF3B30',
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  measurementItem: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  measurementLabel: {
    fontSize: 14,
    color: '#666',
  },
  measurementValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 16,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  goalsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  goalsGroup: {
    marginBottom: 20,
  },
  goalsGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#666',
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  goalStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#34C759',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  goalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  goalProgress: {
    marginBottom: 12,
  },
  goalProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalProgressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  goalProgressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  goalTargetDate: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
