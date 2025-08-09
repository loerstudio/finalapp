import AsyncStorage from '@react-native-async-storage/async-storage';

// Chiavi per AsyncStorage
const STORAGE_KEYS = {
  USER: 'user',
  WORKOUTS: 'workouts',
  MEAL_PLANS: 'meal_plans',
  PROGRESS: 'progress',
  CHATS: 'chats',
  MESSAGES: 'messages',
  EXERCISES: 'exercises',
  FOODS: 'foods',
} as const;

// Tipi per i dati locali
export interface LocalUser {
  id: string;
  email: string;
  role: 'coach' | 'client';
  name?: string;
  created_at: string;
  updated_at: string;
}

export interface LocalWorkout {
  id: string;
  name: string;
  date: string;
  exercises: LocalWorkoutExercise[];
  status: 'assigned' | 'in_progress' | 'completed';
  created_at: string;
}

export interface LocalWorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  completed: boolean;
}

export interface LocalMealPlan {
  id: string;
  name: string;
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meals: LocalMeal[];
}

export interface LocalMeal {
  id: string;
  name: string;
  time: string;
  foods: LocalMealFood[];
}

export interface LocalMealFood {
  id: string;
  name: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_completed: boolean;
}

export interface LocalProgress {
  id: string;
  weight: number;
  date: string;
  notes?: string;
  created_at: string;
}

export interface LocalChat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
}

export interface LocalMessage {
  id: string;
  text: string;
  sender: 'coach' | 'client';
  timestamp: string;
  isRead: boolean;
}

// Servizio per la gestione dei dati locali
class LocalStorageService {
  // User
  async saveUser(user: LocalUser): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Errore nel salvataggio utente:', error);
    }
  }

  async getUser(): Promise<LocalUser | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Errore nel recupero utente:', error);
      return null;
    }
  }

  async clearUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      console.error('Errore nella rimozione utente:', error);
    }
  }

  // Workouts
  async saveWorkouts(workouts: LocalWorkout[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
    } catch (error) {
      console.error('Errore nel salvataggio allenamenti:', error);
    }
  }

  async getWorkouts(): Promise<LocalWorkout[]> {
    try {
      const workoutsData = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS);
      return workoutsData ? JSON.parse(workoutsData) : [];
    } catch (error) {
      console.error('Errore nel recupero allenamenti:', error);
      return [];
    }
  }

  async updateWorkout(workoutId: string, updates: Partial<LocalWorkout>): Promise<void> {
    try {
      const workouts = await this.getWorkouts();
      const updatedWorkouts = workouts.map(workout =>
        workout.id === workoutId ? { ...workout, ...updates } : workout
      );
      await this.saveWorkouts(updatedWorkouts);
    } catch (error) {
      console.error('Errore nell\'aggiornamento allenamento:', error);
    }
  }

  // Meal Plans
  async saveMealPlans(mealPlans: LocalMealPlan[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MEAL_PLANS, JSON.stringify(mealPlans));
    } catch (error) {
      console.error('Errore nel salvataggio piani alimentari:', error);
    }
  }

  async getMealPlans(): Promise<LocalMealPlan[]> {
    try {
      const mealPlansData = await AsyncStorage.getItem(STORAGE_KEYS.MEAL_PLANS);
      return mealPlansData ? JSON.parse(mealPlansData) : [];
    } catch (error) {
      console.error('Errore nel recupero piani alimentari:', error);
      return null;
    }
  }

  async updateMealPlan(mealPlanId: string, updates: Partial<LocalMealPlan>): Promise<void> {
    try {
      const mealPlans = await this.getMealPlans();
      const updatedMealPlans = mealPlans.map(mealPlan =>
        mealPlan.id === mealPlanId ? { ...mealPlan, ...updates } : mealPlan
      );
      await this.saveMealPlans(updatedMealPlans);
    } catch (error) {
      console.error('Errore nell\'aggiornamento piano alimentare:', error);
    }
  }

  // Progress
  async saveProgress(progress: LocalProgress[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Errore nel salvataggio progressi:', error);
    }
  }

  async getProgress(): Promise<LocalProgress[]> {
    try {
      const progressData = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
      return progressData ? JSON.parse(progressData) : [];
    } catch (error) {
      console.error('Errore nel recupero progressi:', error);
      return [];
    }
  }

  async addProgress(progress: LocalProgress): Promise<void> {
    try {
      const progressList = await this.getProgress();
      progressList.push(progress);
      await this.saveProgress(progressList);
    } catch (error) {
      console.error('Errore nell\'aggiunta progresso:', error);
    }
  }

  // Chats
  async saveChats(chats: LocalChat[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
    } catch (error) {
      console.error('Errore nel salvataggio chat:', error);
    }
  }

  async getChats(): Promise<LocalChat[]> {
    try {
      const chatsData = await AsyncStorage.getItem(STORAGE_KEYS.CHATS);
      return chatsData ? JSON.parse(chatsData) : [];
    } catch (error) {
      console.error('Errore nel recupero chat:', error);
      return [];
    }
  }

  // Messages
  async saveMessages(chatId: string, messages: LocalMessage[]): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.MESSAGES}_${chatId}`;
      await AsyncStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('Errore nel salvataggio messaggi:', error);
    }
  }

  async getMessages(chatId: string): Promise<LocalMessage[]> {
    try {
      const key = `${STORAGE_KEYS.MESSAGES}_${chatId}`;
      const messagesData = await AsyncStorage.getItem(key);
      return messagesData ? JSON.parse(messagesData) : [];
    } catch (error) {
      console.error('Errore nel recupero messaggi:', error);
      return [];
    }
  }

  async addMessage(chatId: string, message: LocalMessage): Promise<void> {
    try {
      const messages = await this.getMessages(chatId);
      messages.push(message);
      await this.saveMessages(chatId, messages);
    } catch (error) {
      console.error('Errore nell\'aggiunta messaggio:', error);
    }
  }

  // Pulizia di tutti i dati
  async clearAllData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
      console.log('Tutti i dati sono stati cancellati');
    } catch (error) {
      console.error('Errore nella cancellazione dati:', error);
    }
  }
}

export const localStorageService = new LocalStorageService();
