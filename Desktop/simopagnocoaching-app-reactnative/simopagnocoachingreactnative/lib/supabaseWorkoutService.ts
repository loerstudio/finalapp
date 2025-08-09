import { supabase } from './supabase';
import { User } from '@/types';

export interface SupabaseExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  rest_time?: number;
  completed: boolean;
  workout_id: string;
  created_at: string;
}

export interface SupabaseWorkout {
  id: string;
  name: string;
  date: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  exercises: SupabaseExercise[];
  duration?: number;
  calories_burned?: number;
  coach_id: string;
  client_id: string;
  status: 'assigned' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CreateWorkoutData {
  name: string;
  date: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  exercises: Omit<SupabaseExercise, 'id' | 'workout_id' | 'created_at'>[];
  duration?: number;
  calories_burned?: number;
  coach_id: string;
  client_id: string;
}

export interface UpdateWorkoutData {
  name?: string;
  date?: string;
  type?: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  duration?: number;
  calories_burned?: number;
  status?: 'assigned' | 'in_progress' | 'completed';
}

export interface UpdateExerciseData {
  sets?: number;
  reps?: number;
  weight?: number;
  rest_time?: number;
  completed?: boolean;
}

class SupabaseWorkoutService {
  private subscriptions: Map<string, any> = new Map();

  // Ottiene tutti i workout di un utente
  async getWorkouts(userId: string, role: 'coach' | 'client'): Promise<SupabaseWorkout[]> {
    try {
      let query = supabase
        .from('workouts')
        .select(`
          *,
          exercises (*)
        `)
        .order('created_at', { ascending: false });

      if (role === 'coach') {
        query = query.eq('coach_id', userId);
      } else {
        query = query.eq('client_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Errore nel recupero workout:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Errore nel recupero workout:', error);
      throw error;
    }
  }

  // Ottiene un workout specifico
  async getWorkout(workoutId: string): Promise<SupabaseWorkout | null> {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          exercises (*)
        `)
        .eq('id', workoutId)
        .single();

      if (error) {
        console.error('Errore nel recupero workout:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Errore nel recupero workout:', error);
      throw error;
    }
  }

  // Crea un nuovo workout
  async createWorkout(workoutData: CreateWorkoutData): Promise<SupabaseWorkout> {
    try {
      // Prima crea il workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          name: workoutData.name,
          date: workoutData.date,
          type: workoutData.type,
          duration: workoutData.duration,
          calories_burned: workoutData.calories_burned,
          coach_id: workoutData.coach_id,
          client_id: workoutData.client_id,
          status: 'assigned'
        })
        .select()
        .single();

      if (workoutError) {
        console.error('Errore nella creazione workout:', workoutError);
        throw workoutError;
      }

      // Poi crea gli esercizi
      if (workoutData.exercises.length > 0) {
        const exercisesWithWorkoutId = workoutData.exercises.map(exercise => ({
          ...exercise,
          workout_id: workout.id
        }));

        const { error: exercisesError } = await supabase
          .from('exercises')
          .insert(exercisesWithWorkoutId);

        if (exercisesError) {
          console.error('Errore nella creazione esercizi:', exercisesError);
          throw exercisesError;
        }
      }

      // Ritorna il workout completo con esercizi
      return await this.getWorkout(workout.id) as SupabaseWorkout;
    } catch (error) {
      console.error('Errore nella creazione workout:', error);
      throw error;
    }
  }

  // Aggiorna un workout
  async updateWorkout(workoutId: string, updates: UpdateWorkoutData): Promise<SupabaseWorkout> {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', workoutId)
        .select()
        .single();

      if (error) {
        console.error('Errore nell\'aggiornamento workout:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Errore nell\'aggiornamento workout:', error);
      throw error;
    }
  }

  // Aggiorna un esercizio
  async updateExercise(exerciseId: string, updates: UpdateExerciseData): Promise<SupabaseExercise> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .update(updates)
        .eq('id', exerciseId)
        .select()
        .single();

      if (error) {
        console.error('Errore nell\'aggiornamento esercizio:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Errore nell\'aggiornamento esercizio:', error);
      throw error;
    }
  }

  // Elimina un workout
  async deleteWorkout(workoutId: string): Promise<void> {
    try {
      // Prima elimina gli esercizi
      const { error: exercisesError } = await supabase
        .from('exercises')
        .delete()
        .eq('workout_id', workoutId);

      if (exercisesError) {
        console.error('Errore nell\'eliminazione esercizi:', exercisesError);
        throw exercisesError;
      }

      // Poi elimina il workout
      const { error: workoutError } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);

      if (workoutError) {
        console.error('Errore nell\'eliminazione workout:', workoutError);
        throw workoutError;
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione workout:', error);
      throw error;
    }
  }

  // Sottoscrizione real-time ai workout
  subscribeToWorkouts(userId: string, role: 'coach' | 'client', onUpdate: (workout: SupabaseWorkout) => void, onError?: (error: any) => void) {
    const subscriptionKey = `workouts_${userId}`;
    
    if (this.subscriptions.has(subscriptionKey)) {
      this.unsubscribeFromWorkouts(userId);
    }

    let query = supabase
      .channel(`workouts_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workouts',
          filter: role === 'coach' ? `coach_id=eq.${userId}` : `client_id=eq.${userId}`
        },
        async (payload) => {
          try {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const workout = await this.getWorkout(payload.new.id);
              if (workout) {
                onUpdate(workout);
              }
            } else if (payload.eventType === 'DELETE') {
              // Gestisci eliminazione se necessario
              console.log('Workout eliminato:', payload.old.id);
            }
          } catch (error) {
            console.error('Errore nella gestione aggiornamento workout:', error);
            if (onError) onError(error);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Sottoscrizione workout attiva per ${role} ${userId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Errore nella sottoscrizione workout');
          if (onError) onError(new Error('Errore nella sottoscrizione workout'));
        }
      });

    this.subscriptions.set(subscriptionKey, subscriptionKey);
  }

  // Disiscrizione dai workout
  unsubscribeFromWorkouts(userId: string) {
    const subscriptionKey = `workouts_${userId}`;
    const subscription = this.subscriptions.get(subscriptionKey);
    
    if (subscription) {
      supabase.removeChannel(subscription);
      this.subscriptions.delete(subscriptionKey);
      console.log(`Disiscrizione workout per ${userId}`);
    }
  }

  // Disiscrizione da tutte le sottoscrizioni
  unsubscribeFromAll() {
    this.subscriptions.forEach((subscription, key) => {
      supabase.removeChannel(subscription);
      console.log(`Disiscrizione da ${key}`);
    });
    this.subscriptions.clear();
  }

  // Ottiene statistiche workout
  async getWorkoutStats(userId: string, role: 'coach' | 'client'): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    assigned: number;
  }> {
    try {
      const workouts = await this.getWorkouts(userId, role);
      
      return {
        total: workouts.length,
        completed: workouts.filter(w => w.status === 'completed').length,
        inProgress: workouts.filter(w => w.status === 'in_progress').length,
        assigned: workouts.filter(w => w.status === 'assigned').length
      };
    } catch (error) {
      console.error('Errore nel recupero statistiche workout:', error);
      throw error;
    }
  }
}

export const supabaseWorkoutService = new SupabaseWorkoutService();
