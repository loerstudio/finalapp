import { supabase } from './supabase';
import { 
  NutritionPlan, 
  NutritionPlanDay,
  NutritionPlanMeal,
  NutritionFood,
  ApiResponse,
  PaginatedResponse 
} from '../types';

export class NutritionPlanService {
  // Create nutrition plan
  static async createNutritionPlan(planData: Omit<NutritionPlan, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<NutritionPlan>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('nutrition_plans')
        .insert({
          ...planData,
          coach_id: user.id
        })
        .select(`
          *,
          client:users(*),
          coach:users(*)
        `)
        .single();

      if (error) throw error;

      console.log('✅ Nutrition plan created successfully');

      return {
        data: data,
        success: true,
        message: 'Piano nutrizionale creato con successo'
      };

    } catch (error: any) {
      console.error('❌ createNutritionPlan error:', error);
      return {
        success: false,
        error: error.message || 'Errore nella creazione del piano nutrizionale'
      };
    }
  }

  // Get nutrition plans for coach
  static async getCoachNutritionPlans(): Promise<ApiResponse<NutritionPlan[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('nutrition_plans')
        .select(`
          *,
          client:users(*),
          coach:users(*)
        `)
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        data: data || [],
        success: true
      };

    } catch (error: any) {
      console.error('getCoachNutritionPlans error:', error);
      return {
        success: false,
        error: error.message || 'Errore nel caricamento dei piani nutrizionali'
      };
    }
  }

  // Get nutrition plan for client
  static async getClientNutritionPlan(): Promise<ApiResponse<NutritionPlan | null>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('nutrition_plans')
        .select(`
          *,
          client:users(*),
          coach:users(*),
          nutrition_plan_days(
            *,
            nutrition_plan_meals(
              *,
              nutrition_plan_foods(
                *,
                food:foods(*)
              )
            )
          )
        `)
        .eq('client_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return {
        data: data || null,
        success: true
      };

    } catch (error: any) {
      console.error('getClientNutritionPlan error:', error);
      return {
        success: false,
        error: error.message || 'Errore nel caricamento del piano nutrizionale'
      };
    }
  }

  // Get specific nutrition plan details
  static async getNutritionPlanDetails(planId: string): Promise<ApiResponse<NutritionPlan>> {
    try {
      const { data, error } = await supabase
        .from('nutrition_plans')
        .select(`
          *,
          client:users(*),
          coach:users(*),
          nutrition_plan_days(
            *,
            nutrition_plan_meals(
              *,
              nutrition_plan_foods(
                *,
                food:foods(*)
              )
            )
          )
        `)
        .eq('id', planId)
        .single();

      if (error) throw error;

      return {
        data: data,
        success: true
      };

    } catch (error: any) {
      console.error('getNutritionPlanDetails error:', error);
      return {
        success: false,
        error: error.message || 'Errore nel caricamento del piano nutrizionale'
      };
    }
  }

  // Add day to nutrition plan
  static async addPlanDay(planId: string, dayData: Omit<NutritionPlanDay, 'id' | 'plan_id' | 'created_at'>): Promise<ApiResponse<NutritionPlanDay>> {
    try {
      const { data, error } = await supabase
        .from('nutrition_plan_days')
        .insert({
          ...dayData,
          plan_id: planId
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Plan day added successfully');

      return {
        data: data,
        success: true,
        message: 'Giorno aggiunto al piano con successo'
      };

    } catch (error: any) {
      console.error('❌ addPlanDay error:', error);
      return {
        success: false,
        error: error.message || 'Errore nell\'aggiunta del giorno al piano'
      };
    }
  }

  // Add meal to plan day
  static async addPlanMeal(dayId: string, mealData: Omit<NutritionPlanMeal, 'id' | 'day_id' | 'created_at'>): Promise<ApiResponse<NutritionPlanMeal>> {
    try {
      const { data, error } = await supabase
        .from('nutrition_plan_meals')
        .insert({
          ...mealData,
          day_id: dayId
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Plan meal added successfully');

      return {
        data: data,
        success: true,
        message: 'Pasto aggiunto al piano con successo'
      };

    } catch (error: any) {
      console.error('❌ addPlanMeal error:', error);
      return {
        success: false,
        error: error.message || 'Errore nell\'aggiunta del pasto al piano'
      };
    }
  }

  // Add food to plan meal
  static async addPlanFood(mealId: string, foodData: {
    food_id: string;
    quantity_grams: number;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('nutrition_plan_foods')
        .insert({
          ...foodData,
          meal_id: mealId
        })
        .select(`
          *,
          food:foods(*)
        `)
        .single();

      if (error) throw error;

      console.log('✅ Plan food added successfully');

      return {
        data: data,
        success: true,
        message: 'Cibo aggiunto al pasto con successo'
      };

    } catch (error: any) {
      console.error('❌ addPlanFood error:', error);
      return {
        success: false,
        error: error.message || 'Errore nell\'aggiunta del cibo al pasto'
      };
    }
  }

  // Update nutrition plan
  static async updateNutritionPlan(planId: string, updates: Partial<NutritionPlan>): Promise<ApiResponse<NutritionPlan>> {
    try {
      const { data, error } = await supabase
        .from('nutrition_plans')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .select(`
          *,
          client:users(*),
          coach:users(*)
        `)
        .single();

      if (error) throw error;

      return {
        data: data,
        success: true,
        message: 'Piano nutrizionale aggiornato con successo'
      };

    } catch (error: any) {
      console.error('updateNutritionPlan error:', error);
      return {
        success: false,
        error: error.message || 'Errore nell\'aggiornamento del piano'
      };
    }
  }

  // Activate nutrition plan for client
  static async activateNutritionPlan(planId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First deactivate any existing active plans for this client
      const { data: plan } = await supabase
        .from('nutrition_plans')
        .select('client_id')
        .eq('id', planId)
        .single();

      if (plan) {
        await supabase
          .from('nutrition_plans')
          .update({ is_active: false })
          .eq('client_id', plan.client_id);
      }

      // Then activate the selected plan
      const { error } = await supabase
        .from('nutrition_plans')
        .update({ 
          is_active: true,
          activated_at: new Date().toISOString()
        })
        .eq('id', planId);

      if (error) throw error;

      return {
        data: true,
        success: true,
        message: 'Piano nutrizionale attivato con successo'
      };

    } catch (error: any) {
      console.error('activateNutritionPlan error:', error);
      return {
        success: false,
        error: error.message || 'Errore nell\'attivazione del piano'
      };
    }
  }

  // Delete nutrition plan
  static async deleteNutritionPlan(planId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('nutrition_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;

      return {
        data: true,
        success: true,
        message: 'Piano nutrizionale eliminato con successo'
      };

    } catch (error: any) {
      console.error('deleteNutritionPlan error:', error);
      return {
        success: false,
        error: error.message || 'Errore nell\'eliminazione del piano'
      };
    }
  }

  // Remove food from plan meal
  static async removePlanFood(planFoodId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from('nutrition_plan_foods')
        .delete()
        .eq('id', planFoodId);

      if (error) throw error;

      return {
        data: true,
        success: true,
        message: 'Cibo rimosso dal pasto con successo'
      };

    } catch (error: any) {
      console.error('removePlanFood error:', error);
      return {
        success: false,
        error: error.message || 'Errore nella rimozione del cibo'
      };
    }
  }

  // Update plan food quantity
  static async updatePlanFoodQuantity(planFoodId: string, quantity: number): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('nutrition_plan_foods')
        .update({ quantity_grams: quantity })
        .eq('id', planFoodId)
        .select(`
          *,
          food:foods(*)
        `)
        .single();

      if (error) throw error;

      return {
        data: data,
        success: true,
        message: 'Quantità aggiornata con successo'
      };

    } catch (error: any) {
      console.error('updatePlanFoodQuantity error:', error);
      return {
        success: false,
        error: error.message || 'Errore nell\'aggiornamento della quantità'
      };
    }
  }

  // Calculate plan nutrition totals
  static calculatePlanNutrition(plan: NutritionPlan): any {
    if (!plan.nutrition_plan_days) return null;

    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0
    };

    plan.nutrition_plan_days.forEach(day => {
      if (day.nutrition_plan_meals) {
        day.nutrition_plan_meals.forEach(meal => {
          if (meal.nutrition_plan_foods) {
            meal.nutrition_plan_foods.forEach(planFood => {
              if (planFood.food) {
                const multiplier = planFood.quantity_grams / 100;
                totals.calories += planFood.food.calories_per_100g * multiplier;
                totals.protein += planFood.food.protein_per_100g * multiplier;
                totals.carbs += planFood.food.carbs_per_100g * multiplier;
                totals.fats += planFood.food.fats_per_100g * multiplier;
                totals.fiber += (planFood.food.fiber_per_100g || 0) * multiplier;
              }
            });
          }
        });
      }
    });

    // Calculate daily averages
    const numDays = plan.nutrition_plan_days.length || 1;
    
    return {
      daily_totals: {
        calories: Math.round(totals.calories / numDays),
        protein: Math.round(totals.protein / numDays * 10) / 10,
        carbs: Math.round(totals.carbs / numDays * 10) / 10,
        fats: Math.round(totals.fats / numDays * 10) / 10,
        fiber: Math.round(totals.fiber / numDays * 10) / 10,
      },
      weekly_totals: {
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fats: Math.round(totals.fats * 10) / 10,
        fiber: Math.round(totals.fiber * 10) / 10,
      }
    };
  }

  // Generate meal suggestions based on preferences
  static async generateMealSuggestions(preferences: {
    goal: 'weight_loss' | 'muscle_gain' | 'maintenance';
    dietary_restrictions?: string[];
    daily_calories: number;
    meals_per_day: number;
  }): Promise<ApiResponse<any[]>> {
    try {
      const { data: foods, error } = await supabase
        .from('foods')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      // Basic meal suggestions logic
      const caloriesPerMeal = preferences.daily_calories / preferences.meals_per_day;
      
      const suggestions = [];
      
      // Breakfast suggestions
      suggestions.push({
        meal_type: 'breakfast',
        target_calories: Math.round(caloriesPerMeal * 0.25), // 25% of daily calories
        suggested_foods: foods?.filter(food => 
          food.name.toLowerCase().includes('pane') || 
          food.name.toLowerCase().includes('banana') ||
          food.name.toLowerCase().includes('mela')
        ).slice(0, 3) || []
      });

      // Lunch suggestions
      suggestions.push({
        meal_type: 'lunch',
        target_calories: Math.round(caloriesPerMeal * 0.35), // 35% of daily calories
        suggested_foods: foods?.filter(food => 
          food.name.toLowerCase().includes('pollo') || 
          food.name.toLowerCase().includes('riso') ||
          food.protein_per_100g > 15
        ).slice(0, 4) || []
      });

      // Dinner suggestions
      suggestions.push({
        meal_type: 'dinner',
        target_calories: Math.round(caloriesPerMeal * 0.30), // 30% of daily calories
        suggested_foods: foods?.filter(food => 
          food.protein_per_100g > 10 &&
          food.calories_per_100g < 200
        ).slice(0, 3) || []
      });

      // Snack suggestions
      if (preferences.meals_per_day > 3) {
        suggestions.push({
          meal_type: 'snack',
          target_calories: Math.round(caloriesPerMeal * 0.10), // 10% of daily calories
          suggested_foods: foods?.filter(food => 
            food.name.toLowerCase().includes('mela') ||
            food.name.toLowerCase().includes('banana') ||
            food.calories_per_100g < 100
          ).slice(0, 2) || []
        });
      }

      return {
        data: suggestions,
        success: true
      };

    } catch (error: any) {
      console.error('generateMealSuggestions error:', error);
      return {
        success: false,
        error: error.message || 'Errore nella generazione dei suggerimenti'
      };
    }
  }

  // Clone nutrition plan
  static async cloneNutritionPlan(planId: string, newClientId: string, newTitle: string): Promise<ApiResponse<NutritionPlan>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get original plan with all details
      const originalPlan = await this.getNutritionPlanDetails(planId);
      if (!originalPlan.success || !originalPlan.data) {
        throw new Error('Piano originale non trovato');
      }

      // Create new plan
      const newPlanResponse = await this.createNutritionPlan({
        client_id: newClientId,
        title: newTitle,
        description: originalPlan.data.description,
        target_calories: originalPlan.data.target_calories,
        target_protein: originalPlan.data.target_protein,
        target_carbs: originalPlan.data.target_carbs,
        target_fats: originalPlan.data.target_fats,
        dietary_preferences: originalPlan.data.dietary_preferences,
        notes: originalPlan.data.notes,
        is_active: false
      });

      if (!newPlanResponse.success || !newPlanResponse.data) {
        throw new Error('Errore nella creazione del nuovo piano');
      }

      // Clone days, meals, and foods
      if (originalPlan.data.nutrition_plan_days) {
        for (const day of originalPlan.data.nutrition_plan_days) {
          const newDayResponse = await this.addPlanDay(newPlanResponse.data.id, {
            day_number: day.day_number,
            title: day.title,
            notes: day.notes
          });

          if (newDayResponse.success && newDayResponse.data && day.nutrition_plan_meals) {
            for (const meal of day.nutrition_plan_meals) {
              const newMealResponse = await this.addPlanMeal(newDayResponse.data.id, {
                meal_type: meal.meal_type,
                title: meal.title,
                time: meal.time,
                notes: meal.notes
              });

              if (newMealResponse.success && newMealResponse.data && meal.nutrition_plan_foods) {
                for (const planFood of meal.nutrition_plan_foods) {
                  await this.addPlanFood(newMealResponse.data.id, {
                    food_id: planFood.food_id,
                    quantity_grams: planFood.quantity_grams,
                    notes: planFood.notes
                  });
                }
              }
            }
          }
        }
      }

      return {
        data: newPlanResponse.data,
        success: true,
        message: 'Piano nutrizionale clonato con successo'
      };

    } catch (error: any) {
      console.error('cloneNutritionPlan error:', error);
      return {
        success: false,
        error: error.message || 'Errore nella clonazione del piano'
      };
    }
  }
}