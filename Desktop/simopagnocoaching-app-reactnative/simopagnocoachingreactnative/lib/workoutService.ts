import { supabaseWorkoutService, SupabaseWorkout, SupabaseWorkoutExercise } from './supabaseWorkoutService';
import { Workout, Exercise, WorkoutExercise } from '@/types';

// Utilizziamo le interfacce di Supabase
export type LocalWorkout = SupabaseWorkout;
export type LocalWorkoutExercise = SupabaseWorkoutExercise;

class WorkoutService {
  // Ottieni tutti gli allenamenti di un utente
  async getUserWorkouts(userId: string): Promise<LocalWorkout[]> {
    try {
      const result = await supabaseWorkoutService.getUserWorkouts(userId);
      if (result.error) {
        console.error('Errore nel recupero allenamenti:', result.error);
        return [];
      }
      return result.workouts;
    } catch (error) {
      console.error('Errore nel recupero allenamenti:', error);
      return [];
    }
  }

  // Ottieni un allenamento specifico
  async getWorkout(workoutId: string): Promise<LocalWorkout | null> {
    try {
      const result = await supabaseWorkoutService.getWorkout(workoutId);
      if (result.error) {
        console.error('Errore nel recupero allenamento:', result.error);
        return null;
      }
      return result.workout || null;
    } catch (error) {
      console.error('Errore nel recupero allenamento:', error);
      return null;
    }
  }

  // Crea un nuovo allenamento
  async createWorkout(workout: Omit<LocalWorkout, 'id' | 'created_at'>): Promise<LocalWorkout | null> {
    try {
      const result = await supabaseWorkoutService.createWorkout(workout);
      if (result.error) {
        console.error('Errore nella creazione allenamento:', result.error);
        return null;
      }
      return result.workout || null;
    } catch (error) {
      console.error('Errore nella creazione allenamento:', error);
      return null;
    }
  }

  // Aggiorna lo stato di un allenamento
  async updateWorkoutStatus(workoutId: string, status: 'assigned' | 'in_progress' | 'completed'): Promise<boolean> {
    try {
      const result = await supabaseWorkoutService.updateWorkoutStatus(workoutId, status);
      return result.success;
    } catch (error) {
      console.error('Errore nell\'aggiornamento stato allenamento:', error);
      return false;
    }
  }

  // Completa un esercizio
  async completeExercise(exerciseId: string): Promise<boolean> {
    try {
      const result = await supabaseWorkoutService.completeExercise(exerciseId);
      return result.success;
    } catch (error) {
      console.error('Errore nel completamento esercizio:', error);
      return false;
    }
  }

  // Ottieni tutti gli esercizi disponibili
  async getAvailableExercises(): Promise<Exercise[]> {
    try {
      const result = await supabaseWorkoutService.getAvailableExercises();
      if (result.error) {
        console.error('Errore nel recupero esercizi:', result.error);
        return [];
      }
      return result.exercises;
    } catch (error) {
      console.error('Errore nel recupero esercizi:', error);
      return [];
    }
  }

  // Ottieni statistiche allenamenti
  async getWorkoutStats(userId: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    assigned: number;
  }> {
    try {
      const result = await supabaseWorkoutService.getWorkoutStats(userId);
      if (result.error) {
        console.error('Errore nel calcolo statistiche:', result.error);
        return { total: 0, completed: 0, inProgress: 0, assigned: 0 };
      }
      return result.stats;
    } catch (error) {
      console.error('Errore nel calcolo statistiche:', error);
      return { total: 0, completed: 0, inProgress: 0, assigned: 0 };
    }
  }

  // Crea un allenamento per un cliente (metodo per i coach)
  async createWorkoutForClient(clientId: string, coachId: string, workoutData: {
    name: string;
    date: string;
    exercises: Array<{
      exercise_id: string;
      sets: number;
      reps: number;
      weight?: number;
      rest_time?: number;
      order_index: number;
    }>;
  }): Promise<LocalWorkout | null> {
    try {
      const result = await supabaseWorkoutService.createWorkoutForClient(clientId, coachId, workoutData);
      if (result.error) {
        console.error('Errore nella creazione allenamento per cliente:', result.error);
        return null;
      }
      return result.workout || null;
    } catch (error) {
      console.error('Errore nella creazione allenamento per cliente:', error);
      return null;
    }
  }
}

export const workoutService = new WorkoutService();
