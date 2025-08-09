// Tipi per l'autenticazione
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'coach' | 'client';
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

// Tipi per gli allenamenti
export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_group: string;
  video_url?: string;
  image_url?: string;
  is_favorite?: boolean;
}

export interface WorkoutExercise {
  id: string;
  exercise_id: string;
  workout_id: string;
  sets: number;
  reps: number;
  weight?: number;
  rest_time?: number;
  order: number;
  exercise: Exercise;
}

export interface Workout {
  id: string;
  client_id: string;
  coach_id: string;
  name: string;
  date: string;
  status: 'assigned' | 'in_progress' | 'completed';
  created_at: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutLog {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  reps_completed: number;
  weight_used?: number;
  rest_time?: number;
  completed_at: string;
}

// Tipi per l'alimentazione
export interface Food {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  category: string;
  is_custom?: boolean;
  created_by?: string;
}

export interface MealPlan {
  id: string;
  client_id: string;
  coach_id: string;
  name: string;
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meals: Meal[];
}

export interface Meal {
  id: string;
  meal_plan_id: string;
  name: string;
  time: string;
  foods: MealFood[];
}

export interface MealFood {
  id: string;
  meal_id: string;
  food_id: string;
  quantity: number;
  is_completed: boolean;
  food: Food;
}

// Tipi per i progressi
export interface Progress {
  id: string;
  client_id: string;
  weight: number;
  front_photo_url?: string;
  back_photo_url?: string;
  notes?: string;
  date: string;
  created_at: string;
}

// Tipi per gli obiettivi
export interface Goal {
  id: string;
  client_id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  target_date: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

// Tipi per la chat
export interface Chat {
  id: string;
  coach_id: string;
  client_id: string;
  last_message_at: string;
  created_at: string;
  participants: User[];
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'video';
  media_url?: string;
  is_read: boolean;
  created_at: string;
  sender: User;
}

// Tipi per le notifiche
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'workout_reminder' | 'new_message' | 'progress_update' | 'motivational';
  is_read: boolean;
  created_at: string;
}

// Tipi per l'AI
export interface FoodRecognitionResult {
  food_name: string;
  confidence: number;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

// Tipi per le risposte API
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}
