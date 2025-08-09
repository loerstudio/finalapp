import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabaseWorkoutService, SupabaseWorkout, SupabaseExercise } from '@/lib/supabaseWorkoutService';

export default function WorkoutsScreen() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<SupabaseWorkout[]>([]);
  const [currentWorkout, setCurrentWorkout] = useState<SupabaseWorkout | null>(null);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Carica i workout reali
  useEffect(() => {
    if (user?.id) {
      loadWorkouts();
      // Sottoscrizione real-time ai workout
      supabaseWorkoutService.subscribeToWorkouts(
        user.id,
        'client', // Assumiamo che l'utente sia un cliente
        (updatedWorkout) => {
          setWorkouts(prevWorkouts => {
            const existingIndex = prevWorkouts.findIndex(w => w.id === updatedWorkout.id);
            if (existingIndex >= 0) {
              // Aggiorna workout esistente
              const newWorkouts = [...prevWorkouts];
              newWorkouts[existingIndex] = updatedWorkout;
              return newWorkouts;
            } else {
              // Aggiungi nuovo workout
              return [updatedWorkout, ...prevWorkouts];
            }
          });
        },
        (error) => {
          console.error('Errore nella sottoscrizione workout:', error);
        }
      );

      // Cleanup sottoscrizione
      return () => {
        supabaseWorkoutService.unsubscribeFromWorkouts(user.id);
      };
    }
  }, [user?.id]);

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const data = await supabaseWorkoutService.getWorkouts(user!.id, 'client');
      setWorkouts(data);
      setCurrentWorkout(null);
    } catch (error) {
      console.error('Errore nel caricamento dei workout:', error);
      Alert.alert('Errore', 'Impossibile caricare i workout');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
    setRefreshing(false);
  };

  const toggleExercise = async (exerciseId: string) => {
    if (!currentWorkout) return;

    try {
      const exercise = currentWorkout.exercises.find(e => e.id === exerciseId);
      if (!exercise) return;

      const updatedExercise = await supabaseWorkoutService.updateExercise(exerciseId, {
        completed: !exercise.completed
      });

      // Aggiorna lo stato locale
      setCurrentWorkout(prev => {
        if (!prev) return null;
        return {
          ...prev,
          exercises: prev.exercises.map(e => 
            e.id === exerciseId ? updatedExercise : e
          )
        };
      });
    } catch (error) {
      console.error('Errore nell\'aggiornamento esercizio:', error);
      Alert.alert('Errore', 'Impossibile aggiornare l\'esercizio');
    }
  };

  const startWorkout = (workout: SupabaseWorkout) => {
    setCurrentWorkout(workout);
    setIsWorkoutStarted(true);
    
    // Aggiorna lo stato del workout
    supabaseWorkoutService.updateWorkout(workout.id, { status: 'in_progress' });
  };

  const resetWorkout = () => {
    if (currentWorkout) {
      // Reset tutti gli esercizi
      currentWorkout.exercises.forEach(exercise => {
        supabaseWorkoutService.updateExercise(exercise.id, { completed: false });
      });
      
      // Aggiorna lo stato del workout
      supabaseWorkoutService.updateWorkout(currentWorkout.id, { status: 'assigned' });
    }
    
    setCurrentWorkout(null);
    setIsWorkoutStarted(false);
  };

  const completeWorkout = async () => {
    if (!currentWorkout) return;

    try {
      // Completa tutti gli esercizi
      for (const exercise of currentWorkout.exercises) {
        await supabaseWorkoutService.updateExercise(exercise.id, { completed: true });
      }
      
      // Aggiorna lo stato del workout
      await supabaseWorkoutService.updateWorkout(currentWorkout.id, { status: 'completed' });
      
      Alert.alert('Completato!', 'Workout completato con successo!');
      setCurrentWorkout(null);
      setIsWorkoutStarted(false);
      
      // Ricarica i workout per aggiornare la lista
      loadWorkouts();
    } catch (error) {
      console.error('Errore nel completamento workout:', error);
      Alert.alert('Errore', 'Impossibile completare il workout');
    }
  };

  const renderWorkoutList = () => (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Workout Disponibili</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loading} />
      ) : workouts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Nessun workout disponibile</Text>
          <Text style={styles.emptyStateSubtext}>
            Il tuo coach ti assegnerà presto un nuovo workout
          </Text>
        </View>
      ) : (
        workouts.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            style={[
              styles.workoutCard,
              workout.status === 'completed' && styles.completedWorkout
            ]}
            onPress={() => startWorkout(workout)}
          >
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <View style={[
                styles.statusBadge,
                workout.status === 'completed' && styles.statusCompleted,
                workout.status === 'in_progress' && styles.statusInProgress
              ]}>
                <Text style={styles.statusText}>
                  {workout.status === 'completed' ? 'Completato' : 
                   workout.status === 'in_progress' ? 'In Corso' : 'Assegnato'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.workoutDate}>{workout.date}</Text>
            <Text style={styles.workoutType}>{workout.type}</Text>
            
            <View style={styles.exerciseCount}>
              <Text style={styles.exerciseCountText}>
                {workout.exercises.length} esercizi
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderCurrentWorkout = () => {
    if (!currentWorkout) return null;

    const completedExercises = currentWorkout.exercises.filter(e => e.completed).length;
    const totalExercises = currentWorkout.exercises.length;
    const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

    return (
      <View style={styles.container}>
        <View style={styles.workoutHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentWorkout(null)}
          >
            <Text style={styles.backButtonText}>← Torna alla lista</Text>
          </TouchableOpacity>
          
          <Text style={styles.currentWorkoutTitle}>{currentWorkout.name}</Text>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedExercises} di {totalExercises} esercizi completati
          </Text>
        </View>

        <ScrollView style={styles.exercisesList}>
          {currentWorkout.exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <TouchableOpacity
                style={[
                  styles.exerciseCheckbox,
                  exercise.completed && styles.exerciseCompleted
                ]}
                onPress={() => toggleExercise(exercise.id)}
              >
                {exercise.completed && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              
              <View style={styles.exerciseInfo}>
                <Text style={[
                  styles.exerciseName,
                  exercise.completed && styles.exerciseNameCompleted
                ]}>
                  {exercise.name}
                </Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.sets} serie × {exercise.reps} ripetizioni
                  {exercise.weight && ` @ ${exercise.weight}kg`}
                  {exercise.rest_time && ` (riposo: ${exercise.rest_time}s)`}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.workoutActions}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetWorkout}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.completeButton,
              progress < 100 && styles.completeButtonDisabled
            ]}
            onPress={completeWorkout}
            disabled={progress < 100}
          >
            <Text style={styles.completeButtonText}>Completa Workout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && workouts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Caricamento workout...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {currentWorkout ? renderCurrentWorkout() : renderWorkoutList()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  loading: {
    marginTop: 50,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  workoutCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedWorkout: {
    opacity: 0.7,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
  },
  statusCompleted: {
    backgroundColor: '#c8e6c9',
  },
  statusInProgress: {
    backgroundColor: '#fff3e0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1976d2',
  },
  workoutDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  workoutType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  exerciseCount: {
    alignItems: 'flex-end',
  },
  exerciseCountText: {
    fontSize: 12,
    color: '#999',
  },
  currentWorkoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginVertical: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  exercisesList: {
    flex: 1,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  exerciseCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseCompleted: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exerciseNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666',
  },
  workoutActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  completeButton: {
    flex: 2,
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
