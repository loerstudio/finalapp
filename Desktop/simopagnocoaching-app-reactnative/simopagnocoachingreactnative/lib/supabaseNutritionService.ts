import { supabase } from './supabase';

export interface SupabaseFood {
  id: string;
  name: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_completed: boolean;
  meal_id: string;
  created_at: string;
}

export interface SupabaseMeal {
  id: string;
  name: string;
  time: string;
  foods: SupabaseFood[];
  meal_plan_id: string;
  created_at: string;
}

export interface SupabaseMealPlan {
  id: string;
  name: string;
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meals: SupabaseMeal[];
  coach_id: string;
  client_id: string;
  status: 'assigned' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CreateMealPlanData {
  name: string;
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meals: Array<{
    name: string;
    time: string;
    foods: Array<{
      name: string;
      quantity: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }>;
  }>;
  coach_id: string;
  client_id: string;
}

export interface UpdateMealPlanData {
  name?: string;
  date?: string;
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  status?: 'assigned' | 'in_progress' | 'completed';
}

export interface UpdateFoodData {
  quantity?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  is_completed?: boolean;
}

class SupabaseNutritionService {
  private subscriptions: Map<string, any> = new Map();

  // Ottiene tutti i piani alimentari di un utente
  async getMealPlans(userId: string, role: 'coach' | 'client'): Promise<SupabaseMealPlan[]> {
    try {
      let query = supabase
        .from('meal_plans')
        .select(`
          *,
          meals (
            *,
            foods (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (role === 'coach') {
        query = query.eq('coach_id', userId);
      } else {
        query = query.eq('client_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Errore nel recupero piani alimentari:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Errore nel recupero piani alimentari:', error);
      throw error;
    }
  }

  // Ottiene un piano alimentare specifico
  async getMealPlan(mealPlanId: string): Promise<SupabaseMealPlan | null> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meals (
            *,
            foods (*)
          )
        `)
        .eq('id', mealPlanId)
        .single();

      if (error) {
        console.error('Errore nel recupero piano alimentare:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Errore nel recupero piano alimentare:', error);
      throw error;
    }
  }

  // Crea un nuovo piano alimentare
  async createMealPlan(mealPlanData: CreateMealPlanData): Promise<SupabaseMealPlan> {
    try {
      // Prima crea il piano alimentare
      const { data: mealPlan, error: mealPlanError } = await supabase
        .from('meal_plans')
        .insert({
          name: mealPlanData.name,
          date: mealPlanData.date,
          total_calories: mealPlanData.total_calories,
          total_protein: mealPlanData.total_protein,
          total_carbs: mealPlanData.total_carbs,
          total_fat: mealPlanData.total_fat,
          coach_id: mealPlanData.coach_id,
          client_id: mealPlanData.client_id,
          status: 'assigned'
        })
        .select()
        .single();

      if (mealPlanError) {
        console.error('Errore nella creazione piano alimentare:', mealPlanError);
        throw mealPlanError;
      }

      // Poi crea i pasti
      for (const mealData of mealPlanData.meals) {
        const { data: meal, error: mealError } = await supabase
          .from('meals')
          .insert({
            name: mealData.name,
            time: mealData.time,
            meal_plan_id: mealPlan.id
          })
          .select()
          .single();

        if (mealError) {
          console.error('Errore nella creazione pasto:', mealError);
          throw mealError;
        }

        // Poi crea i cibi per questo pasto
        if (mealData.foods.length > 0) {
          const foodsWithMealId = mealData.foods.map(food => ({
            ...food,
            meal_id: meal.id,
            is_completed: false
          }));

          const { error: foodsError } = await supabase
            .from('foods')
            .insert(foodsWithMealId);

          if (foodsError) {
            console.error('Errore nella creazione cibi:', foodsError);
            throw foodsError;
          }
        }
      }

      // Ritorna il piano alimentare completo
      return await this.getMealPlan(mealPlan.id) as SupabaseMealPlan;
    } catch (error) {
      console.error('Errore nella creazione piano alimentare:', error);
      throw error;
    }
  }

  // Aggiorna un piano alimentare
  async updateMealPlan(mealPlanId: string, updates: UpdateMealPlanData): Promise<SupabaseMealPlan> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', mealPlanId)
        .select()
        .single();

      if (error) {
        console.error('Errore nell\'aggiornamento piano alimentare:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Errore nell\'aggiornamento piano alimentare:', error);
      throw error;
    }
  }

  // Aggiorna un cibo
  async updateFood(foodId: string, updates: UpdateFoodData): Promise<SupabaseFood> {
    try {
      const { data, error } = await supabase
        .from('foods')
        .update(updates)
        .eq('id', foodId)
        .select()
        .single();

      if (error) {
        console.error('Errore nell\'aggiornamento cibo:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Errore nell\'aggiornamento cibo:', error);
      throw error;
    }
  }

  // Elimina un piano alimentare
  async deleteMealPlan(mealPlanId: string): Promise<void> {
    try {
      // Prima elimina i cibi
      const { error: foodsError } = await supabase
        .from('foods')
        .delete()
        .in('meal_id', 
          supabase
            .from('meals')
            .select('id')
            .eq('meal_plan_id', mealPlanId)
        );

      if (foodsError) {
        console.error('Errore nell\'eliminazione cibi:', foodsError);
        throw foodsError;
      }

      // Poi elimina i pasti
      const { error: mealsError } = await supabase
        .from('meals')
        .delete()
        .eq('meal_plan_id', mealPlanId);

      if (mealsError) {
        console.error('Errore nell\'eliminazione pasti:', mealsError);
        throw mealsError;
      }

      // Infine elimina il piano alimentare
      const { error: mealPlanError } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', mealPlanId);

      if (mealPlanError) {
        console.error('Errore nell\'eliminazione piano alimentare:', mealPlanError);
        throw mealPlanError;
      }
    } catch (error) {
      console.error('Errore nell\'eliminazione piano alimentare:', error);
      throw error;
    }
  }

  // Sottoscrizione real-time ai piani alimentari
  subscribeToMealPlans(userId: string, role: 'coach' | 'client', onUpdate: (mealPlan: SupabaseMealPlan) => void, onError?: (error: any) => void) {
    const subscriptionKey = `meal_plans_${userId}`;
    
    if (this.subscriptions.has(subscriptionKey)) {
      this.unsubscribeFromMealPlans(userId);
    }

    let query = supabase
      .channel(`meal_plans_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meal_plans',
          filter: role === 'coach' ? `coach_id=eq.${userId}` : `client_id=eq.${userId}`
        },
        async (payload) => {
          try {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const mealPlan = await this.getMealPlan(payload.new.id);
              if (mealPlan) {
                onUpdate(mealPlan);
              }
            } else if (payload.eventType === 'DELETE') {
              console.log('Piano alimentare eliminato:', payload.old.id);
            }
          } catch (error) {
            console.error('Errore nella gestione aggiornamento piano alimentare:', error);
            if (onError) onError(error);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Sottoscrizione piano alimentare attiva per ${role} ${userId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Errore nella sottoscrizione piano alimentare');
          if (onError) onError(new Error('Errore nella sottoscrizione piano alimentare'));
        }
      });

    this.subscriptions.set(subscriptionKey, subscriptionKey);
  }

  // Disiscrizione dai piani alimentari
  unsubscribeFromMealPlans(userId: string) {
    const subscriptionKey = `meal_plans_${userId}`;
    const subscription = this.subscriptions.get(subscriptionKey);
    
    if (subscription) {
      supabase.removeChannel(subscription);
      this.subscriptions.delete(subscriptionKey);
      console.log(`Disiscrizione piano alimentare per ${userId}`);
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

  // Ottiene statistiche nutrizione
  async getNutritionStats(userId: string, role: 'coach' | 'client'): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    assigned: number;
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  }> {
    try {
      const mealPlans = await this.getMealPlans(userId, role);
      
      const stats = {
        total: mealPlans.length,
        completed: mealPlans.filter(mp => mp.status === 'completed').length,
        inProgress: mealPlans.filter(mp => mp.status === 'in_progress').length,
        assigned: mealPlans.filter(mp => mp.status === 'assigned').length,
        totalCalories: mealPlans.reduce((sum, mp) => sum + mp.total_calories, 0),
        totalProtein: mealPlans.reduce((sum, mp) => sum + mp.total_protein, 0),
        totalCarbs: mealPlans.reduce((sum, mp) => sum + mp.total_carbs, 0),
        totalFat: mealPlans.reduce((sum, mp) => sum + mp.total_fat, 0)
      };

      return stats;
    } catch (error) {
      console.error('Errore nel recupero statistiche nutrizione:', error);
      throw error;
    }
  }

  // Ottiene cibi completati oggi
  async getTodayCompletedFoods(userId: string, role: 'coach' | 'client'): Promise<SupabaseFood[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const mealPlans = await this.getMealPlans(userId, role);
      
      const todayMealPlans = mealPlans.filter(mp => mp.date === today);
      const todayFoods: SupabaseFood[] = [];
      
      todayMealPlans.forEach(mp => {
        mp.meals.forEach(meal => {
          meal.foods.forEach(food => {
            if (food.is_completed) {
              todayFoods.push(food);
            }
          });
        });
      });

      return todayFoods;
    } catch (error) {
      console.error('Errore nel recupero cibi completati oggi:', error);
      throw error;
    }
  }
}

export const supabaseNutritionService = new SupabaseNutritionService();
