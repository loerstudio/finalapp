import { AppwriteDatabaseService } from './appwrite';
import { NutritionPlan, NutritionFood, FoodLog, ApiResponse } from '../types';

export class NutritionService {
  // Get nutrition plans for user
  static async getNutritionPlans(userId: string): Promise<NutritionPlan[]> {
    try {
      console.log('🥗 Getting nutrition plans for user:', userId);
      
      const response = await AppwriteDatabaseService.getNutritionPlans(userId);
      
      const plans: NutritionPlan[] = response.documents.map((doc: any) => ({
        id: doc.$id,
        name: doc.name,
        description: doc.description,
        coach_id: doc.coach_id,
        client_id: doc.client_id,
        daily_calories: doc.daily_calories,
        daily_protein: doc.daily_protein,
        daily_carbs: doc.daily_carbs,
        daily_fats: doc.daily_fats,
        is_active: doc.is_active,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        meals: doc.meals || []
      }));
      
      console.log('✅ Retrieved', plans.length, 'nutrition plans');
      return plans;
    } catch (error: any) {
      console.error('❌ getNutritionPlans error:', error);
      throw new Error(error.message);
    }
  }

  // Create nutrition plan
  static async createNutritionPlan(planData: {
    name: string;
    description?: string;
    coach_id: string;
    client_id: string;
    daily_calories: number;
    daily_protein: number;
    daily_carbs: number;
    daily_fats: number;
  }): Promise<NutritionPlan> {
    try {
      console.log('📋 Creating nutrition plan:', planData.name);
      
      const response = await AppwriteDatabaseService.createNutritionPlan({
        name: planData.name,
        description: planData.description || '',
        coach_id: 'current-coach-id', // Will be set from current user
        client_id: planData.client_id,
        daily_calories: planData.daily_calories,
        daily_protein: planData.daily_protein,
        daily_carbs: planData.daily_carbs,
        daily_fats: planData.daily_fats,
        is_active: true,
        meals: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      console.log('✅ Nutrition plan created successfully');
      return response;
    } catch (error: any) {
      console.error('❌ createNutritionPlan error:', error);
      throw new Error(error.message);
    }
  }

  // Get food database
  static async getFoods(): Promise<NutritionFood[]> {
    try {
      console.log('🍎 Getting food database');
      
      const response = await AppwriteDatabaseService.getFoods();
      
      const foods: NutritionFood[] = response.documents.map((doc: any) => ({
        id: doc.$id,
        name: doc.name,
        calories_per_100g: doc.calories_per_100g,
        protein_per_100g: doc.protein_per_100g,
        carbs_per_100g: doc.carbs_per_100g,
        fats_per_100g: doc.fats_per_100g,
        fiber_per_100g: doc.fiber_per_100g,
        sugar_per_100g: doc.sugar_per_100g,
        sodium_per_100g: doc.sodium_per_100g,
        barcode: doc.barcode,
        image_url: doc.image_url,
        created_at: doc.created_at,
        updated_at: doc.updated_at
      }));
      
      console.log('✅ Retrieved', foods.length, 'foods');
      return foods;
    } catch (error: any) {
      console.error('❌ getFoods error:', error);
      throw new Error(error.message);
    }
  }

  // Create food log entry
  static async createFoodLog(logData: {
    client_id: string;
    food_id: string;
    quantity_grams: number;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  }): Promise<FoodLog> {
    try {
      console.log('📝 Creating food log entry');
      
      const response = await AppwriteDatabaseService.createFoodLog(logData);
      
      const foodLog: FoodLog = {
        id: response.$id,
        client_id: response.client_id,
        food_id: response.food_id,
        quantity_grams: response.quantity_grams,
        meal_type: response.meal_type,
        logged_at: response.logged_at,
        created_at: response.created_at
      };
      
      console.log('✅ Food log entry created successfully');
      return foodLog;
    } catch (error: any) {
      console.error('❌ createFoodLog error:', error);
      throw new Error(error.message);
    }
  }

  // Get food logs for user
  static async getFoodLogs(clientId: string): Promise<FoodLog[]> {
    try {
      console.log('📊 Getting food logs for client:', clientId);
      
      const response = await AppwriteDatabaseService.getFoodLogs(clientId);
      
      const foodLogs: FoodLog[] = response.documents.map((doc: any) => ({
        id: doc.$id,
        client_id: doc.client_id,
        food_id: doc.food_id,
        quantity_grams: doc.quantity_grams,
        meal_type: doc.meal_type,
        logged_at: doc.logged_at,
        created_at: doc.created_at
      }));
      
      console.log('✅ Retrieved', foodLogs.length, 'food logs');
      return foodLogs;
    } catch (error: any) {
      console.error('❌ getFoodLogs error:', error);
      throw new Error(error.message);
    }
  }

  // Search foods
  static async searchFoods(query: string): Promise<NutritionFood[]> {
    try {
      console.log('🔍 Searching foods:', query);
      
      const response = await AppwriteDatabaseService.searchFoods(query);
      
      const foods: NutritionFood[] = response.documents.map((doc: any) => ({
        id: doc.$id,
        name: doc.name,
        calories_per_100g: doc.calories_per_100g,
        protein_per_100g: doc.protein_per_100g,
        carbs_per_100g: doc.carbs_per_100g,
        fats_per_100g: doc.fats_per_100g,
        fiber_per_100g: doc.fiber_per_100g,
        sugar_per_100g: doc.sugar_per_100g,
        sodium_per_100g: doc.sodium_per_100g,
        barcode: doc.barcode,
        image_url: doc.image_url,
        created_at: doc.created_at,
        updated_at: doc.updated_at
      }));
      
      console.log('✅ Found', foods.length, 'foods matching query');
      return foods;
    } catch (error: any) {
      console.error('❌ searchFoods error:', error);
      throw new Error(error.message);
    }
  }
}