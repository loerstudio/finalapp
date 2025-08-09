import { UserProfile, DailyTracker, Meal } from '@/types/food';

// Simple in-memory storage for demo purposes
// In production, use AsyncStorage or a database
let userProfile: UserProfile | null = null;
let dailyTrackers: { [date: string]: DailyTracker } = {};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  userProfile = profile;
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  return userProfile;
};

export const saveDailyTracker = async (tracker: DailyTracker): Promise<void> => {
  dailyTrackers[tracker.date] = tracker;
};

export const getDailyTracker = async (date: string): Promise<DailyTracker | null> => {
  return dailyTrackers[date] || null;
};

export const getAllDailyTrackers = async (): Promise<DailyTracker[]> => {
  return Object.values(dailyTrackers).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const addMealToDay = async (date: string, meal: Meal, goals: any): Promise<void> => {
  let tracker = dailyTrackers[date];
  
  if (!tracker) {
    tracker = {
      date,
      meals: [],
      totalNutrition: {
        calories: 0,
        protein: 0,
        sugar: 0,
        fat: 0,
      },
      goals,
    };
  }
  
  tracker.meals.push(meal);
  
  // Recalculate totals
  tracker.totalNutrition = tracker.meals.reduce((total, m) => ({
    calories: total.calories + m.totalNutrition.calories,
    protein: total.protein + m.totalNutrition.protein,
    sugar: total.sugar + m.totalNutrition.sugar,
    fat: total.fat + m.totalNutrition.fat,
  }), {
    calories: 0,
    protein: 0,
    sugar: 0,
    fat: 0,
  });
  
  dailyTrackers[date] = tracker;
};