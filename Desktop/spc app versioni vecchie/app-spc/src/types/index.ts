// SPC Fitness - Type Definitions

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'client' | 'coach';
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  
  // Client specific fields
  coach_id?: string;
  has_nutrition_plan: boolean;
  subscription_type?: 'basic' | 'premium';
  subscription_expires_at?: string;
  
  // Coach specific fields
  active_client_id?: string;
  is_verified: boolean;
  specializations?: string[];
}

export interface Client {
  id: string;
  user_id: string;
  coach_id: string;
  has_nutrition_plan: boolean;
  subscription_type: 'basic' | 'premium';
  subscription_expires_at?: string;
  goals?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: User;
  coach?: User;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_groups: string[];
  equipment: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  video_url?: string;
  evolution_fit_id?: string;
  instructions: string[];
  tips?: string[];
  created_at: string;
  updated_at: string;
}

export interface WorkoutProgram {
  id: string;
  name: string;
  description?: string;
  coach_id: string;
  client_id: string;
  weeks: WorkoutWeek[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  coach?: User;
  client?: User;
}

export interface WorkoutWeek {
  id: string;
  program_id: string;
  week_number: number;
  name: string;
  days: WorkoutDay[];
  created_at: string;
  updated_at: string;
}

export interface WorkoutDay {
  id: string;
  week_id: string;
  day_number: number;
  name: string;
  muscle_groups: string[];
  exercises: WorkoutExercise[];
  rest_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  day_id: string;
  exercise_id: string;
  order_index: number;
  sets: number;
  reps: string; // "8-12" or "10" or "AMRAP"
  weight?: number;
  rest_seconds?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  exercise?: Exercise;
}

export interface WorkoutSession {
  id: string;
  client_id: string;
  program_id: string;
  week_id: string;
  day_id: string;
  started_at: string;
  completed_at?: string;
  status: 'in_progress' | 'completed' | 'skipped';
  exercises: WorkoutSessionExercise[];
  feedback?: WorkoutFeedback;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSessionExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  sets_completed: WorkoutSet[];
  notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutSet {
  set_number: number;
  reps: number;
  weight: number;
  completed: boolean;
  rest_duration?: number;
}

export interface WorkoutFeedback {
  id: string;
  session_id: string;
  rating: number; // 1-5 stars
  feeling: 'terrible' | 'bad' | 'okay' | 'good' | 'amazing';
  effort_level: number; // 1-10
  notes?: string;
  created_at: string;
}

export interface NutritionPlan {
  id: string;
  name: string;
  description?: string;
  coach_id: string;
  client_id: string;
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fats: number;
  meals: NutritionMeal[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NutritionMeal {
  id: string;
  plan_id: string;
  name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: NutritionFood[];
  target_calories: number;
  created_at: string;
  updated_at: string;
}

export interface NutritionFood {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fats_per_100g: number;
  fiber_per_100g?: number;
  sugar_per_100g?: number;
  sodium_per_100g?: number;
  barcode?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface FoodLog {
  id: string;
  client_id: string;
  food_id: string;
  quantity_grams: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  logged_at: string;
  created_at: string;
  
  // Relations
  food?: NutritionFood;
}

export interface FoodScan {
  id: string;
  client_id: string;
  image_url: string;
  scan_result: FoodScanResult;
  created_at: string;
}

export interface FoodScanResult {
  is_food: boolean;
  confidence: number;
  food_name?: string;
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  quantity_estimate?: string;
  error_message?: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message_type: 'text' | 'image' | 'workout_share' | 'nutrition_share';
  content: string;
  image_url?: string;
  metadata?: Record<string, any>;
  read_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  sender?: User;
  receiver?: User;
}

export interface ProgressGoal {
  id: string;
  client_id: string;
  goal_type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'strength' | 'endurance' | 'custom';
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  unit: string; // 'kg', 'lbs', 'cm', '%', etc.
  target_date: string;
  is_achieved: boolean;
  progress_updates: ProgressUpdate[];
  before_photo?: string;
  after_photo?: string;
  created_at: string;
  updated_at: string;
}

export interface ProgressUpdate {
  id: string;
  goal_id: string;
  value: number;
  notes?: string;
  photo_url?: string;
  created_at: string;
}

export interface BodyMetrics {
  id: string;
  client_id: string;
  weight: number;
  height?: number;
  body_fat_percentage?: number;
  muscle_mass_percentage?: number;
  bmi?: number;
  measurements?: Record<string, number>; // chest, waist, arms, etc.
  photos?: string[];
  recorded_at: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'workout_reminder' | 'new_message' | 'goal_achieved' | 'nutrition_reminder' | 'general';
  data?: Record<string, any>;
  read_at?: string;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Form Types
export interface CreateClientRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  has_nutrition_plan: boolean;
  subscription_type: 'basic' | 'premium';
  goals?: string[];
  notes?: string;
}

export interface CreateWorkoutProgramRequest {
  name: string;
  description?: string;
  client_id: string;
  weeks: {
    name: string;
    days: {
      name: string;
      muscle_groups: string[];
      rest_day: boolean;
      exercises: {
        exercise_id: string;
        sets: number;
        reps: string;
        weight?: number;
        rest_seconds?: number;
        notes?: string;
      }[];
    }[];
  }[];
}

export interface ChatGPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Navigation Types
export interface RootStackParamList {
  Login: undefined;
  ClientStack: undefined;
  CoachStack: undefined;
}

export interface CoachStackParamList {
  CoachMain: undefined;
  ClientManagement: undefined;
  CreateClient: undefined;
  ClientDetail: { clientId: string };
  WorkoutPrograms: undefined;
  CreateWorkoutProgram: { clientId?: string };
  EditWorkoutProgram: { programId: string };
  NutritionPlans: undefined;
  CreateNutritionPlan: { clientId?: string };
  EditNutritionPlan: { planId: string };
  ClientProgress: { clientId?: string };
  ExerciseLibrary: undefined;
  FoodDatabase: undefined;
  FoodScan: undefined;
  LiveWorkout: undefined;
  CoachManagement: undefined;
  CoachChat: { clientId?: string };
}

export interface ClientStackParamList {
  ClientMain: undefined;
  WorkoutDetail: { programId: string };
  StartWorkout: { dayId: string };
  LiveWorkout: { sessionId: string };
  NutritionDetail: { planId: string };
  FoodScan: undefined;
  FoodLog: undefined;
  ProgressGoals: undefined;
  CreateGoal: undefined;
  GoalDetail: { goalId: string };
  Chat: { coachId?: string };
}

export type NavigationProps = {
  navigation: any;
  route?: any;
};