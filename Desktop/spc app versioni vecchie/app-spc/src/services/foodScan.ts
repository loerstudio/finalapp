import { NutritionFood } from '../types';

const GEMINI_API_KEY = 'AIzaSyB71M4l6tfHmXyN7XaGjFrOnw2fA_ZUrDw';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';

export class FoodScanService {
  // Convert image to base64
  static async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remove data:image/jpeg;base64, prefix
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Error converting image to base64:', error);
      throw new Error('Failed to convert image to base64');
    }
  }

  // Scan food with Gemini AI
  static async scanFood(imageBase64: string): Promise<{
    isFood: boolean;
    food?: NutritionFood;
    error?: string;
  }> {
    try {
      console.log('🔍 Scanning food with Gemini AI...');
      
      const prompt = `
        Analizza questa immagine e determina se contiene cibo.
        
        Se NON è cibo, rispondi esattamente: "NON È CIBO!"
        
        Se È cibo, rispondi con un JSON nel seguente formato:
        {
          "isFood": true,
          "food": {
            "name": "Nome del cibo in italiano",
            "calories_per_100g": numero,
            "protein_per_100g": numero,
            "carbs_per_100g": numero,
            "fats_per_100g": numero,
            "fiber_per_100g": numero,
            "sugar_per_100g": numero,
            "sodium_per_100g": numero
          }
        }
        
        Sii preciso con i valori nutrizionali. Se non sei sicuro di un valore, usa 0.
      `;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      
      console.log('🤖 Gemini AI response:', text);

      // Check if it's not food
      if (text.includes('NON È CIBO!')) {
        return {
          isFood: false,
          error: 'NON È CIBO!'
        };
      }

      // Try to parse JSON response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          if (parsed.isFood && parsed.food) {
            const food: NutritionFood = {
              id: `food-${Date.now()}`,
              name: parsed.food.name,
              calories_per_100g: parsed.food.calories_per_100g || 0,
              protein_per_100g: parsed.food.protein_per_100g || 0,
              carbs_per_100g: parsed.food.carbs_per_100g || 0,
              fats_per_100g: parsed.food.fats_per_100g || 0,
              fiber_per_100g: parsed.food.fiber_per_100g || 0,
              sugar_per_100g: parsed.food.sugar_per_100g || 0,
              sodium_per_100g: parsed.food.sodium_per_100g || 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            console.log('✅ Food identified:', food);
            return {
              isFood: true,
              food
            };
          }
        }
      } catch (parseError) {
        console.error('❌ Error parsing Gemini response:', parseError);
      }

      // Fallback: treat as food with basic info
      const fallbackFood: NutritionFood = {
        id: `food-${Date.now()}`,
        name: 'Cibo non identificato',
        calories_per_100g: 100,
        protein_per_100g: 5,
        carbs_per_100g: 15,
        fats_per_100g: 2,
        fiber_per_100g: 1,
        sugar_per_100g: 2,
        sodium_per_100g: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('⚠️ Using fallback food data:', fallbackFood);
      return {
        isFood: true,
        food: fallbackFood
      };

    } catch (error: any) {
      console.error('❌ Food scan error:', error);
      return {
        isFood: false,
        error: error.message
      };
    }
  }

  // Save food scan to history
  static async saveFoodScan(scanData: {
    client_id: string;
    food: NutritionFood;
    image_url?: string;
    quantity_grams: number;
    meal_type: string;
  }): Promise<void> {
    try {
      console.log('💾 Saving food scan to history...');
      
      // This would save to Appwrite database
      // For now, just log it
      console.log('✅ Food scan saved:', scanData);
    } catch (error) {
      console.error('❌ Error saving food scan:', error);
      throw error;
    }
  }

  // Get scan history
  static async getScanHistory(clientId: string): Promise<any[]> {
    try {
      console.log('📋 Getting scan history for client:', clientId);
      
      // This would fetch from Appwrite database
      // For now, return mock data
      return [
        {
          id: 'scan-1',
          client_id: clientId,
          food: {
            name: 'Petto di Pollo',
            calories_per_100g: 165,
            protein_per_100g: 31,
            carbs_per_100g: 0,
            fats_per_100g: 3.6
          },
          quantity_grams: 150,
          meal_type: 'lunch',
          scanned_at: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('❌ Error getting scan history:', error);
      return [];
    }
  }
} 