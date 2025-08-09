import { Platform } from 'react-native';

// Free AI Service for calorie tracking using public APIs and local data
export interface FoodItem {
  itemType: 'food';
  name: string;
  weight: number;
  calories: number;
  carbs: number;
  proteins: number;
  fats: number;
  water: number;
}

export interface ActivityItem {
  itemType: 'activity';
  name: string;
  caloriesBurned: number;
  durationInMinutes: number;
}

export interface UserProfile {
  id: string;
  gender: string;
  age: number;
  weight: number;
  height: number;
  calorieDeficit: number;
  carbPercentage: number;
  proteinPercentage: number;
  fatPercentage: number;
  goals: string;
}

export interface AIAnalysisResult {
  success: boolean;
  data?: FoodItem | ActivityItem;
  error?: string;
  confidence?: number;
}

// Local food database for common foods
const FOOD_DATABASE = {
  'mela': { name: 'Mela', calories: 52, carbs: 14, proteins: 0.3, fats: 0.2, water: 85 },
  'banana': { name: 'Banana', calories: 89, carbs: 23, proteins: 1.1, fats: 0.3, water: 75 },
  'pasta': { name: 'Pasta', calories: 131, carbs: 25, proteins: 5, fats: 1.1, water: 62 },
  'pane': { name: 'Pane', calories: 265, carbs: 49, proteins: 9, fats: 3.2, water: 35 },
  'riso': { name: 'Riso', calories: 130, carbs: 28, proteins: 2.7, fats: 0.3, water: 68 },
  'pollo': { name: 'Pollo', calories: 165, carbs: 0, proteins: 31, fats: 3.6, water: 65 },
  'tonno': { name: 'Tonno', calories: 144, carbs: 0, proteins: 30, fats: 1, water: 68 },
  'uova': { name: 'Uova', calories: 155, carbs: 1.1, proteins: 13, fats: 11, water: 75 },
  'latte': { name: 'Latte', calories: 42, carbs: 5, proteins: 3.4, fats: 1, water: 88 },
  'yogurt': { name: 'Yogurt', calories: 59, carbs: 3.6, proteins: 10, fats: 0.4, water: 85 },
  'formaggio': { name: 'Formaggio', calories: 113, carbs: 0.4, proteins: 7, fats: 9, water: 82 },
  'insalata': { name: 'Insalata', calories: 15, carbs: 3, proteins: 1.4, fats: 0.2, water: 95 },
  'pomodoro': { name: 'Pomodoro', calories: 18, carbs: 4, proteins: 0.9, fats: 0.2, water: 94 },
  'carota': { name: 'Carota', calories: 41, carbs: 10, proteins: 0.9, fats: 0.2, water: 88 },
  'patata': { name: 'Patata', calories: 77, carbs: 17, proteins: 2, fats: 0.1, water: 79 },
  'cipolla': { name: 'Cipolla', calories: 40, carbs: 9, proteins: 1.1, fats: 0.1, water: 89 },
  'aglio': { name: 'Aglio', calories: 149, carbs: 33, proteins: 6.4, fats: 0.5, water: 59 },
  'olio': { name: 'Olio d\'oliva', calories: 884, carbs: 0, proteins: 0, fats: 100, water: 0 },
  'burro': { name: 'Burro', calories: 717, carbs: 0.1, proteins: 0.9, fats: 81, water: 18 },
  'zucchero': { name: 'Zucchero', calories: 387, carbs: 100, proteins: 0, fats: 0, water: 0 }
};

// Activity database with calorie burn rates (per hour for 70kg person)
const ACTIVITY_DATABASE = {
  'corsa': { name: 'Corsa', caloriesPerHour: 600, intensity: 'high' },
  'camminata': { name: 'Camminata', caloriesPerHour: 300, intensity: 'low' },
  'passeggiata': { name: 'Passeggiata', caloriesPerHour: 250, intensity: 'low' },
  'nuoto': { name: 'Nuoto', caloriesPerHour: 500, intensity: 'medium' },
  'ciclismo': { name: 'Ciclismo', caloriesPerHour: 400, intensity: 'medium' },
  'palestra': { name: 'Allenamento in palestra', caloriesPerHour: 450, intensity: 'medium' },
  'pesi': { name: 'Allenamento pesi', caloriesPerHour: 350, intensity: 'medium' },
  'yoga': { name: 'Yoga', caloriesPerHour: 200, intensity: 'low' },
  'pilates': { name: 'Pilates', caloriesPerHour: 250, intensity: 'low' },
  'calcio': { name: 'Calcio', caloriesPerHour: 600, intensity: 'high' },
  'tennis': { name: 'Tennis', caloriesPerHour: 500, intensity: 'high' },
  'basketball': { name: 'Basketball', caloriesPerHour: 550, intensity: 'high' },
  'danza': { name: 'Danza', caloriesPerHour: 400, intensity: 'medium' },
  'arrampicata': { name: 'Arrampicata', caloriesPerHour: 500, intensity: 'high' },
  'boxe': { name: 'Boxe', caloriesPerHour: 700, intensity: 'high' }
};

class FreeAIService {
  
  // Analyze food description using local database and simple NLP
  async analyzeFoodDescription(description: string, userProfile?: UserProfile): Promise<AIAnalysisResult> {
    try {
      const lowerDesc = description.toLowerCase();
      const words = lowerDesc.split(/\s+/);
      
      // Find matching foods
      let bestMatch = null;
      let bestScore = 0;
      
      for (const [key, food] of Object.entries(FOOD_DATABASE)) {
        let score = 0;
        
        // Exact match gets highest score
        if (lowerDesc.includes(key)) {
          score += 10;
        }
        
        // Partial matches
        for (const word of words) {
          if (key.includes(word) || word.includes(key)) {
            score += 5;
          }
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = { key, food };
        }
      }
      
      if (bestMatch && bestScore > 0) {
        // Estimate weight based on description
        const weight = this.estimateWeight(lowerDesc, bestMatch.food.name);
        
        const foodData: FoodItem = {
          itemType: 'food',
          name: bestMatch.food.name,
          weight: weight,
          calories: Math.round((bestMatch.food.calories * weight) / 100),
          carbs: Math.round((bestMatch.food.carbs * weight) / 100 * 10) / 10,
          proteins: Math.round((bestMatch.food.proteins * weight) / 100 * 10) / 10,
          fats: Math.round((bestMatch.food.fats * weight) / 100 * 10) / 10,
          water: Math.round((bestMatch.food.water * weight) / 100)
        };
        
        return {
          success: true,
          data: foodData,
          confidence: Math.min(90, bestScore * 10)
        };
      }
      
      return {
        success: false,
        error: 'Cibo non riconosciuto. Prova a descrivere più dettagliatamente.'
      };

    } catch (error) {
      console.error('Free AI food analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante l\'analisi'
      };
    }
  }

  // Analyze activity description
  async analyzeActivityDescription(description: string, userProfile?: UserProfile): Promise<AIAnalysisResult> {
    try {
      const lowerDesc = description.toLowerCase();
      const words = lowerDesc.split(/\s+/);
      
      // Find matching activities
      let bestMatch = null;
      let bestScore = 0;
      
      for (const [key, activity] of Object.entries(ACTIVITY_DATABASE)) {
        let score = 0;
        
        if (lowerDesc.includes(key)) {
          score += 10;
        }
        
        for (const word of words) {
          if (key.includes(word) || word.includes(key)) {
            score += 5;
          }
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = { key, activity };
        }
      }
      
      if (bestMatch && bestScore > 0) {
        // Extract duration from description
        const duration = this.extractDuration(lowerDesc);
        
        // Calculate calories burned based on user weight
        const userWeight = userProfile?.weight || 70;
        const weightMultiplier = userWeight / 70;
        const caloriesPerHour = bestMatch.activity.caloriesPerHour * weightMultiplier;
        const caloriesBurned = Math.round((caloriesPerHour * duration) / 60);
        
        const activityData: ActivityItem = {
          itemType: 'activity',
          name: bestMatch.activity.name,
          caloriesBurned: caloriesBurned,
          durationInMinutes: duration
        };
        
        return {
          success: true,
          data: activityData,
          confidence: Math.min(85, bestScore * 10)
        };
      }
      
      return {
        success: false,
        error: 'Attività non riconosciuta. Prova a descrivere più dettagliatamente.'
      };

    } catch (error) {
      console.error('Free AI activity analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante l\'analisi'
      };
    }
  }

  // Get dietary recommendations using local logic
  async getDietaryRecommendations(
    remainingCalories: number, 
    remainingCarbs: number, 
    remainingProteins: number, 
    remainingFats: number,
    userProfile?: UserProfile
  ): Promise<string> {
    try {
      const suggestions = [];
      
      // Find foods that fit the remaining calories
      for (const [key, food] of Object.entries(FOOD_DATABASE)) {
        const foodCalories = food.calories;
        const foodCarbs = food.carbs;
        const foodProteins = food.proteins;
        const foodFats = food.fats;
        
        // Check if this food fits the remaining allowances
        if (foodCalories <= remainingCalories && 
            foodCarbs <= remainingCarbs && 
            foodProteins <= remainingProteins && 
            foodFats <= remainingFats) {
          
          const weight = Math.min(100, remainingCalories / foodCalories * 100);
          suggestions.push(`${food.name} (${Math.round(weight)}g)`);
        }
      }
      
      if (suggestions.length > 0) {
        return `Suggerimenti per ${remainingCalories} kcal rimanenti:\n\n${suggestions.slice(0, 3).join('\n')}`;
      } else {
        return 'Per le calorie rimanenti, prova con porzioni più piccole o cibi meno calorici.';
      }

    } catch (error) {
      console.error('Free AI recommendations error:', error);
      return 'Impossibile generare raccomandazioni al momento.';
    }
  }

  // Get activity suggestions
  async getActivitySuggestions(
    currentActivityLevel: string,
    userGoals: string,
    availableTime: number,
    userProfile?: UserProfile
  ): Promise<string> {
    try {
      const suggestions = [];
      
      for (const [key, activity] of Object.entries(ACTIVITY_DATABASE)) {
        if (availableTime >= 15) { // Minimum 15 minutes
          const userWeight = userProfile?.weight || 70;
          const weightMultiplier = userWeight / 70;
          const caloriesPerHour = activity.caloriesPerHour * weightMultiplier;
          const caloriesBurned = Math.round((caloriesPerHour * availableTime) / 60);
          
          suggestions.push(`${activity.name}: ${caloriesBurned} kcal in ${availableTime} min`);
        }
      }
      
      if (suggestions.length > 0) {
        return `Suggerimenti attività per ${availableTime} minuti:\n\n${suggestions.slice(0, 3).join('\n')}`;
      } else {
        return 'Prova ad aumentare il tempo disponibile per l\'attività fisica.';
      }

    } catch (error) {
      console.error('Free AI activity suggestions error:', error);
      return 'Impossibile generare suggerimenti al momento.';
    }
  }

  // Helper methods
  private estimateWeight(description: string, foodName: string): number {
    // Extract weight from description
    const weightMatch = description.match(/(\d+)\s*(g|grammi|gr)/i);
    if (weightMatch) {
      return parseInt(weightMatch[1]);
    }
    
    // Estimate based on common portions
    const portions = {
      'mela': 182, 'banana': 118, 'pasta': 100, 'pane': 30, 'riso': 100,
      'pollo': 100, 'tonno': 100, 'uova': 50, 'latte': 240, 'yogurt': 170,
      'formaggio': 30, 'insalata': 100, 'pomodoro': 100, 'carota': 100,
      'patata': 150, 'cipolla': 100, 'aglio': 10, 'olio': 15, 'burro': 15
    };
    
    for (const [key, weight] of Object.entries(portions)) {
      if (description.includes(key)) {
        return weight;
      }
    }
    
    return 100; // Default weight
  }

  private extractDuration(description: string): number {
    // Extract duration from description
    const durationMatch = description.match(/(\d+)\s*(min|minuti|minuto)/i);
    if (durationMatch) {
      return parseInt(durationMatch[1]);
    }
    
    // Default duration based on activity intensity
    if (description.includes('corsa') || description.includes('calcio')) {
      return 30;
    } else if (description.includes('camminata') || description.includes('passeggiata')) {
      return 45;
    } else {
      return 30; // Default 30 minutes
    }
  }
}

// Export singleton instance
export const freeAIService = new FreeAIService();
export default freeAIService; 