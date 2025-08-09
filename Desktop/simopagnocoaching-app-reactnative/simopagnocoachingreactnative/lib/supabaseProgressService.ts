import { supabase } from './supabase';

export interface SupabaseProgressData {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  body_fat: number;
  muscle_mass: number;
  chest: number;
  waist: number;
  hips: number;
  biceps: number;
  thighs: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseGoal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  target_date: string;
  status: 'active' | 'completed' | 'cancelled';
  category: 'weight' | 'body_fat' | 'muscle_mass' | 'measurements' | 'custom';
  created_at: string;
  updated_at: string;
}

export interface CreateProgressData {
  user_id: string;
  date: string;
  weight: number;
  body_fat: number;
  muscle_mass: number;
  chest: number;
  waist: number;
  hips: number;
  biceps: number;
  thighs: number;
  notes?: string;
}

export interface UpdateProgressData {
  weight?: number;
  body_fat?: number;
  muscle_mass?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  notes?: string;
}

export interface CreateGoalData {
  user_id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  target_date: string;
  category: 'weight' | 'body_fat' | 'muscle_mass' | 'measurements' | 'custom';
}

export interface UpdateGoalData {
  title?: string;
  description?: string;
  target_value?: number;
  current_value?: number;
  unit?: string;
  target_date?: string;
  status?: 'active' | 'completed' | 'cancelled';
  category?: 'weight' | 'body_fat' | 'muscle_mass' | 'measurements' | 'custom';
}

class SupabaseProgressService {
  private subscriptions: Map<string, any> = new Map();

  // Ottiene tutti i dati di progresso di un utente
  async getProgressData(userId: string): Promise<SupabaseProgressData[]> {
    try {
      const { data, error } = await supabase
        .from('progress_data')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Errore nel recupero dati progresso:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Errore nel recupero dati progresso:', error);
      throw error;
    }
  }

  // Ottiene un dato di progresso specifico
  async getProgressDataById(progressId: string): Promise<SupabaseProgressData | null> {
    try {
      const { data, error } = await supabase
        .from('progress_data')
        .select('*')
        .eq('id', progressId)
        .single();

      if (error) {
        console.error('Errore nel recupero dato progresso:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Errore nel recupero dato progresso:', error);
      throw error;
    }
  }

  // Ottiene i dati di progresso per una data specifica
  async getProgressDataByDate(userId: string, date: string): Promise<SupabaseProgressData | null> {
    try {
      const { data, error } = await supabase
        .from('progress_data')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Nessun dato trovato per questa data
          return null;
        }
        console.error('Errore nel recupero dato progresso per data:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Errore nel recupero dato progresso per data:', error);
      throw error;
    }
  }

  // Crea un nuovo dato di progresso
  async createProgressData(progressData: CreateProgressData): Promise<SupabaseProgressData> {
    try {
      const { data, error } = await supabase
        .from('progress_data')
        .insert(progressData)
        .select()
        .single();

      if (error) {
        console.error('Errore nella creazione dato progresso:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Errore nella creazione dato progresso:', error);
      throw error;
    }
  }

  // Aggiorna un dato di progresso
  async updateProgressData(progressId: string, updates: UpdateProgressData): Promise<SupabaseProgressData> {
    try {
      const { data, error } = await supabase
        .from('progress_data')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', progressId)
        .select()
        .single();

      if (error) {
        console.error('Errore nell\'aggiornamento dato progresso:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Errore nell\'aggiornamento dato progresso:', error);
      throw error;
    }
  }

  // Elimina un dato di progresso
  async deleteProgressData(progressId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('progress_data')
        .delete()
        .eq('id', progressId);

      if (error) {
        console.error('Errore nell\'eliminazione dato progresso:', error);
        throw error;
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione dato progresso:', error);
      throw error;
    }
  }

  // Ottiene tutti gli obiettivi di un utente
  async getGoals(userId: string): Promise<SupabaseGoal[]> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Errore nel recupero obiettivi:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Errore nel recupero obiettivi:', error);
      throw error;
    }
  }

  // Ottiene un obiettivo specifico
  async getGoal(goalId: string): Promise<SupabaseGoal | null> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .single();

      if (error) {
        console.error('Errore nel recupero obiettivo:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Errore nel recupero obiettivo:', error);
      throw error;
    }
  }

  // Crea un nuovo obiettivo
  async createGoal(goalData: CreateGoalData): Promise<SupabaseGoal> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          ...goalData,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Errore nella creazione obiettivo:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Errore nella creazione obiettivo:', error);
      throw error;
    }
  }

  // Aggiorna un obiettivo
  async updateGoal(goalId: string, updates: UpdateGoalData): Promise<SupabaseGoal> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .select()
        .single();

      if (error) {
        console.error('Errore nell\'aggiornamento obiettivo:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Errore nell\'aggiornamento obiettivo:', error);
      throw error;
    }
  }

  // Elimina un obiettivo
  async deleteGoal(goalId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) {
        console.error('Errore nell\'eliminazione obiettivo:', error);
        throw error;
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione obiettivo:', error);
      throw error;
    }
  }

  // Sottoscrizione real-time ai dati di progresso
  subscribeToProgress(userId: string, onUpdate: (progressData: SupabaseProgressData) => void, onError?: (error: any) => void) {
    const subscriptionKey = `progress_${userId}`;
    
    if (this.subscriptions.has(subscriptionKey)) {
      this.unsubscribeFromProgress(userId);
    }

    let query = supabase
      .channel(`progress_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'progress_data',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          try {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const progressData = await this.getProgressDataById(payload.new.id);
              if (progressData) {
                onUpdate(progressData);
              }
            } else if (payload.eventType === 'DELETE') {
              console.log('Dato progresso eliminato:', payload.old.id);
            }
          } catch (error) {
            console.error('Errore nella gestione aggiornamento progresso:', error);
            if (onError) onError(error);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Sottoscrizione progresso attiva per ${userId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Errore nella sottoscrizione progresso');
          if (onError) onError(new Error('Errore nella sottoscrizione progresso'));
        }
      });

    this.subscriptions.set(subscriptionKey, subscriptionKey);
  }

  // Sottoscrizione real-time agli obiettivi
  subscribeToGoals(userId: string, onUpdate: (goal: SupabaseGoal) => void, onError?: (error: any) => void) {
    const subscriptionKey = `goals_${userId}`;
    
    if (this.subscriptions.has(subscriptionKey)) {
      this.unsubscribeFromGoals(userId);
    }

    let query = supabase
      .channel(`goals_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          try {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const goal = await this.getGoal(payload.new.id);
              if (goal) {
                onUpdate(goal);
              }
            } else if (payload.eventType === 'DELETE') {
              console.log('Obiettivo eliminato:', payload.old.id);
            }
          } catch (error) {
            console.error('Errore nella gestione aggiornamento obiettivo:', error);
            if (onError) onError(error);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Sottoscrizione obiettivi attiva per ${userId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Errore nella sottoscrizione obiettivi');
          if (onError) onError(new Error('Errore nella sottoscrizione obiettivi'));
        }
      });

    this.subscriptions.set(subscriptionKey, subscriptionKey);
  }

  // Disiscrizione dal progresso
  unsubscribeFromProgress(userId: string) {
    const subscriptionKey = `progress_${userId}`;
    const subscription = this.subscriptions.get(subscriptionKey);
    
    if (subscription) {
      supabase.removeChannel(subscription);
      this.subscriptions.delete(subscriptionKey);
      console.log(`Disiscrizione progresso per ${userId}`);
    }
  }

  // Disiscrizione dagli obiettivi
  unsubscribeFromGoals(userId: string) {
    const subscriptionKey = `goals_${userId}`;
    const subscription = this.subscriptions.get(subscriptionKey);
    
    if (subscription) {
      supabase.removeChannel(subscription);
      this.subscriptions.delete(subscriptionKey);
      console.log(`Disiscrizione obiettivi per ${userId}`);
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

  // Ottiene statistiche del progresso
  async getProgressStats(userId: string): Promise<{
    totalMeasurements: number;
    latestWeight: number | null;
    latestBodyFat: number | null;
    weightChange: number | null;
    bodyFatChange: number | null;
    activeGoals: number;
    completedGoals: number;
  }> {
    try {
      const progressData = await this.getProgressData(userId);
      const goals = await this.getGoals(userId);
      
      if (progressData.length === 0) {
        return {
          totalMeasurements: 0,
          latestWeight: null,
          latestBodyFat: null,
          weightChange: null,
          bodyFatChange: null,
          activeGoals: goals.filter(g => g.status === 'active').length,
          completedGoals: goals.filter(g => g.status === 'completed').length
        };
      }

      const sortedData = progressData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = sortedData[0];
      const previous = sortedData[1];

      const stats = {
        totalMeasurements: progressData.length,
        latestWeight: latest.weight,
        latestBodyFat: latest.body_fat,
        weightChange: previous ? latest.weight - previous.weight : null,
        bodyFatChange: previous ? latest.body_fat - previous.body_fat : null,
        activeGoals: goals.filter(g => g.status === 'active').length,
        completedGoals: goals.filter(g => g.status === 'completed').length
      };

      return stats;
    } catch (error) {
      console.error('Errore nel recupero statistiche progresso:', error);
      throw error;
    }
  }

  // Ottiene i dati di progresso degli ultimi N giorni
  async getRecentProgress(userId: string, days: number = 30): Promise<SupabaseProgressData[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      const cutoffDateString = cutoffDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('progress_data')
        .select('*')
        .eq('user_id', userId)
        .gte('date', cutoffDateString)
        .order('date', { ascending: true });

      if (error) {
        console.error('Errore nel recupero progresso recente:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Errore nel recupero progresso recente:', error);
      throw error;
    }
  }
}

export const supabaseProgressService = new SupabaseProgressService();
