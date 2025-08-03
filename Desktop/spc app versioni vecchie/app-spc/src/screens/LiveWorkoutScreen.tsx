import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Colors } from '../constants/colors';
import { WorkoutService } from '../services/workout';
import { WorkoutSession, WorkoutSet, WorkoutFeedback } from '../types';

interface LiveWorkoutScreenProps {
  navigation: any;
  route: any;
}

export default function LiveWorkoutScreen({ navigation, route }: LiveWorkoutScreenProps) {
  const { sessionId } = route.params;
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseSets, setExerciseSets] = useState<{ [key: string]: WorkoutSet[] }>({});
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState<Omit<WorkoutFeedback, 'id' | 'session_id' | 'created_at'>>({
    rating: 5,
    feeling: 'good',
    effort_level: 7,
    notes: ''
  });

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResting && restTimer > 0) {
      timer = setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isResting, restTimer]);

  const loadSession = async () => {
    try {
      const response = await WorkoutService.getWorkoutSession(sessionId);
      if (response.success && response.data) {
        setSession(response.data);
        
        // Initialize exercise sets
        const initialSets: { [key: string]: WorkoutSet[] } = {};
        response.data.exercises?.forEach(ex => {
          initialSets[ex.id] = ex.sets_completed || [];
        });
        setExerciseSets(initialSets);
      } else {
        Alert.alert('Errore', response.error || 'Sessione non trovata');
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore nel caricamento della sessione');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const addSet = (exerciseId: string) => {
    setExerciseSets(prev => ({
      ...prev,
      [exerciseId]: [
        ...(prev[exerciseId] || []),
        {
          set_number: (prev[exerciseId]?.length || 0) + 1,
          reps: 0,
          weight: 0,
          completed: false
        }
      ]
    }));
  };

  const updateSet = (exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: number) => {
    setExerciseSets(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((set, index) => 
        index === setIndex ? { ...set, [field]: value } : set
      )
    }));
  };

  const completeSet = async (exerciseId: string, setIndex: number) => {
    const sets = exerciseSets[exerciseId];
    if (!sets || !sets[setIndex]) return;

    const updatedSets = sets.map((set, index) => 
      index === setIndex ? { ...set, completed: true } : set
    );

    setExerciseSets(prev => ({
      ...prev,
      [exerciseId]: updatedSets
    }));

    // Save to database
    const sessionExercise = session?.exercises?.find(ex => ex.exercise_id === exerciseId);
    if (sessionExercise) {
      await WorkoutService.updateSessionExercise(sessionExercise.id, updatedSets);
    }

    // Start rest timer if there's a next set or exercise
    const currentExercise = session?.exercises?.[currentExerciseIndex];
    if (currentExercise?.exercise?.rest_seconds) {
      setRestTimer(currentExercise.exercise.rest_seconds);
      setIsResting(true);
    }
  };

  const nextExercise = () => {
    if (session?.exercises && currentExerciseIndex < session.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const previousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const finishWorkout = () => {
    setShowFeedbackModal(true);
  };

  const submitFeedback = async () => {
    try {
      const response = await WorkoutService.completeWorkoutSession(sessionId, feedback);
      if (response.success) {
        Alert.alert(
          'Allenamento Completato!',
          'Grande lavoro! Il tuo allenamento è stato salvato.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ClientMain')
            }
          ]
        );
      } else {
        Alert.alert('Errore', response.error || 'Errore nel completamento');
      }
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore nel completamento');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Caricamento allenamento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session || !session.exercises || session.exercises.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Nessun esercizio trovato</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Torna Indietro</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentExercise = session.exercises[currentExerciseIndex];
  const currentSets = exerciseSets[currentExercise.exercise_id] || [];
  const completedSets = currentSets.filter(set => set.completed).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBackText}>← Exit</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{session.day?.name}</Text>
          <Text style={styles.headerSubtitle}>
            Esercizio {currentExerciseIndex + 1} di {session.exercises.length}
          </Text>
        </View>
        <TouchableOpacity onPress={finishWorkout}>
          <Text style={styles.headerFinishText}>Finisci</Text>
        </TouchableOpacity>
      </View>

      {/* Rest Timer */}
      {isResting && (
        <View style={styles.restTimer}>
          <Text style={styles.restTimerTitle}>Riposo</Text>
          <Text style={styles.restTimerTime}>{formatTime(restTimer)}</Text>
          <TouchableOpacity 
            style={styles.skipRestButton}
            onPress={() => setIsResting(false)}
          >
            <Text style={styles.skipRestText}>Salta Riposo</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Exercise */}
        <View style={styles.exerciseCard}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseName}>{currentExercise.exercise?.name}</Text>
            <Text style={styles.exerciseTarget}>
              {currentExercise.sets} serie × {currentExercise.reps} reps
            </Text>
          </View>

          {currentExercise.exercise?.instructions && (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Istruzioni:</Text>
              {currentExercise.exercise.instructions.map((instruction, index) => (
                <Text key={index} style={styles.instructionText}>
                  • {instruction}
                </Text>
              ))}
            </View>
          )}

          {/* Sets */}
          <View style={styles.setsContainer}>
            <Text style={styles.setsTitle}>
              Serie ({completedSets}/{currentSets.length})
            </Text>
            
            {currentSets.map((set, index) => (
              <View 
                key={index} 
                style={[styles.setRow, set.completed && styles.setRowCompleted]}
              >
                <Text style={styles.setNumber}>{set.set_number}</Text>
                
                <View style={styles.setInputs}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Peso (kg)</Text>
                    <TextInput
                      style={styles.setInput}
                      value={set.weight.toString()}
                      onChangeText={(text) => updateSet(currentExercise.exercise_id, index, 'weight', parseFloat(text) || 0)}
                      keyboardType="numeric"
                      editable={!set.completed}
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Reps</Text>
                    <TextInput
                      style={styles.setInput}
                      value={set.reps.toString()}
                      onChangeText={(text) => updateSet(currentExercise.exercise_id, index, 'reps', parseInt(text) || 0)}
                      keyboardType="numeric"
                      editable={!set.completed}
                    />
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[styles.completeButton, set.completed && styles.completeButtonDone]}
                  onPress={() => completeSet(currentExercise.exercise_id, index)}
                  disabled={set.completed}
                >
                  <Text style={styles.completeButtonText}>
                    {set.completed ? '✓' : 'Fatto'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity 
              style={styles.addSetButton}
              onPress={() => addSet(currentExercise.exercise_id)}
            >
              <Text style={styles.addSetButtonText}>+ Aggiungi Serie</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentExerciseIndex === 0 && styles.navButtonDisabled]}
            onPress={previousExercise}
            disabled={currentExerciseIndex === 0}
          >
            <Text style={styles.navButtonText}>← Precedente</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.navButton, currentExerciseIndex === session.exercises.length - 1 && styles.navButtonDisabled]}
            onPress={nextExercise}
            disabled={currentExerciseIndex === session.exercises.length - 1}
          >
            <Text style={styles.navButtonText}>Prossimo →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Come ti sei sentito?</Text>
            <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Rating */}
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackLabel}>Valutazione complessiva</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setFeedback(prev => ({ ...prev, rating: star }))}
                  >
                    <Text style={[styles.star, feedback.rating >= star && styles.starActive]}>
                      ⭐
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Feeling */}
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackLabel}>Come ti sei sentito?</Text>
              <View style={styles.feelingButtons}>
                {[
                  { key: 'terrible', label: 'Pessimo', emoji: '😞' },
                  { key: 'bad', label: 'Male', emoji: '😕' },
                  { key: 'okay', label: 'Ok', emoji: '😐' },
                  { key: 'good', label: 'Bene', emoji: '😊' },
                  { key: 'amazing', label: 'Fantastico', emoji: '🤩' },
                ].map(feeling => (
                  <TouchableOpacity
                    key={feeling.key}
                    style={[
                      styles.feelingButton,
                      feedback.feeling === feeling.key && styles.feelingButtonActive
                    ]}
                    onPress={() => setFeedback(prev => ({ ...prev, feeling: feeling.key as any }))}
                  >
                    <Text style={styles.feelingEmoji}>{feeling.emoji}</Text>
                    <Text style={styles.feelingText}>{feeling.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Effort Level */}
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackLabel}>
                Livello di sforzo (1-10): {feedback.effort_level}
              </Text>
              <View style={styles.effortSlider}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.effortButton,
                      feedback.effort_level >= level && styles.effortButtonActive
                    ]}
                    onPress={() => setFeedback(prev => ({ ...prev, effort_level: level }))}
                  >
                    <Text style={styles.effortButtonText}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackLabel}>Note (opzionale)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Come è andato l'allenamento? Qualche difficoltà?"
                multiline
                numberOfLines={4}
                value={feedback.notes}
                onChangeText={(text) => setFeedback(prev => ({ ...prev, notes: text }))}
              />
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={submitFeedback}>
              <Text style={styles.submitButtonText}>Completa Allenamento</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: Colors.error,
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.text,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBackText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  headerFinishText: {
    color: Colors.success,
    fontSize: 16,
    fontWeight: '600',
  },
  restTimer: {
    backgroundColor: Colors.warning,
    padding: 16,
    alignItems: 'center',
  },
  restTimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  restTimerTime: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 12,
  },
  skipRestButton: {
    backgroundColor: Colors.text,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  skipRestText: {
    color: Colors.warning,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  exerciseCard: {
    margin: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exerciseHeader: {
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  exerciseTarget: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  instructionsContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  setsContainer: {
    marginTop: 16,
  },
  setsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  setRowCompleted: {
    backgroundColor: Colors.success,
    opacity: 0.8,
  },
  setNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    width: 30,
  },
  setInputs: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 12,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  setInput: {
    backgroundColor: Colors.surface,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  completeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  completeButtonDone: {
    backgroundColor: Colors.success,
  },
  completeButtonText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  addSetButton: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addSetButtonText: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
    gap: 16,
  },
  navButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    color: Colors.text,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  modalClose: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  feedbackSection: {
    marginBottom: 24,
  },
  feedbackLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  star: {
    fontSize: 32,
    opacity: 0.3,
  },
  starActive: {
    opacity: 1,
  },
  feelingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  feelingButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  feelingButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  feelingEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  feelingText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  effortSlider: {
    flexDirection: 'row',
    gap: 4,
  },
  effortButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  effortButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  effortButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    height: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.success,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
});