export interface NutritionInfo {
  calories: number;
  protein: number; // grams
  sugar: number; // grams
  fat: number; // grams
  carbohydrates?: number; // grams
  fiber?: number; // grams
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  nutrition: NutritionInfo;
  confidence: number; // 0-1 confidence score from AI
}

export interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timestamp: string;
  imageUri?: string;
  foods: FoodItem[];
  totalNutrition: NutritionInfo;
  notes?: string;
}

export interface DailyTracker {
  date: string; // YYYY-MM-DD format
  meals: Meal[];
  totalNutrition: NutritionInfo;
  waterIntake?: number; // glasses
  goals: {
    calories: number;
    protein: number;
    sugar: number;
    fat: number;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  weight?: number; // kg
  height?: number; // cm
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goals: {
    calories: number;
    protein: number;
    sugar: number;
    fat: number;
  };
  createdAt: string;
}