import { ApiResponse } from '../types';

// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyB71M4l6tfHmXyN7XaGjFrOnw2fA_ZUrDw';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface FoodScanResult {
  isFood: boolean;
  foodName?: string;
  nutritionalValues?: {
    calories_per_100g: number;
    protein_per_100g: number;
    carbs_per_100g: number;
    fats_per_100g: number;
    fiber_per_100g?: number;
    sugar_per_100g?: number;
    sodium_per_100g?: number;
  };
  description?: string;
  confidence: number;
}

export class GeminiService {
  /**
   * Scan food image using Gemini Vision API
   */
  static async scanFoodImage(imageUri: string): Promise<ApiResponse<FoodScanResult>> {
    try {
      console.log('🔍 Scanning food image with Gemini...');

      // Convert image to base64
      const base64Image = await this.convertImageToBase64(imageUri);

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `Analizza questa immagine e dimmi se è cibo o no.

ISTRUZIONI PRECISE:
1. Se NON è cibo (es: oggetti, persone, animali, paesaggi), rispondi esattamente: "NON È CIBO!"
2. Se È CIBO, fornisci queste informazioni in formato JSON:

{
  "isFood": true,
  "foodName": "nome del cibo in italiano",
  "nutritionalValues": {
    "calories_per_100g": numero,
    "protein_per_100g": numero,
    "carbs_per_100g": numero, 
    "fats_per_100g": numero,
    "fiber_per_100g": numero,
    "sugar_per_100g": numero,
    "sodium_per_100g": numero
  },
  "description": "breve descrizione del cibo",
  "confidence": numero da 0 a 1
}

IMPORTANTE: 
- Valori nutrizionali devono essere per 100g
- Se non sei sicuro al 100% che sia cibo, rispondi "NON È CIBO!"
- Usa valori nutrizionali realistici e precisi
- confidence deve riflettere quanto sei sicuro dell'identificazione`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 1024,
        }
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API error:', errorData);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }

      const resultText = data.candidates[0].content.parts[0].text;
      console.log('🤖 Gemini response:', resultText);

      // Check if it's not food
      if (resultText.includes('NON È CIBO!')) {
        return {
          data: {
            isFood: false,
            confidence: 0.95
          },
          success: true,
          message: 'NON È CIBO!'
        };
      }

      // Try to parse JSON response for food
      try {
        // Clean the response text (remove markdown formatting if present)
        const cleanText = resultText.replace(/```json|```/g, '').trim();
        const foodResult = JSON.parse(cleanText);

        // Validate the response structure
        if (!foodResult.isFood || !foodResult.foodName || !foodResult.nutritionalValues) {
          throw new Error('Invalid food data structure');
        }

        return {
          data: foodResult,
          success: true,
          message: `Cibo identificato: ${foodResult.foodName}`
        };

      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);
        
        // If parsing fails, try to extract basic info
        const fallbackResult: FoodScanResult = {
          isFood: resultText.toLowerCase().includes('cibo') || resultText.toLowerCase().includes('food'),
          foodName: 'Cibo non identificato',
          confidence: 0.5,
          description: 'Impossibile identificare con precisione'
        };

        return {
          data: fallbackResult,
          success: true,
          message: 'Identificazione parziale'
        };
      }

    } catch (error: any) {
      console.error('❌ scanFoodImage error:', error);
      return {
        success: false,
        error: error.message || 'Errore durante la scansione del cibo'
      };
    }
  }

  /**
   * Convert image URI to base64
   */
  private static async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            // Remove data:image/jpeg;base64, prefix
            const base64 = reader.result.split(',')[1];
            resolve(base64);
          } else {
            reject(new Error('Failed to convert image to base64'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image');
    }
  }

  /**
   * Get food suggestions based on partial name
   */
  static async getFoodSuggestions(partialName: string): Promise<ApiResponse<string[]>> {
    try {
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `Dammi 5 suggerimenti di cibi italiani che iniziano con "${partialName}". 
                
Rispondi solo con una lista JSON di stringhe, esempio:
["pasta al pomodoro", "pizza margherita", "parmigiana di melanzane", "pollo alla cacciatora", "patate al forno"]

IMPORTANTE: 
- Solo nomi di cibi reali
- In italiano
- Massimo 5 suggerimenti
- Solo la lista JSON, nient'altro`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 200,
        }
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const resultText = data.candidates[0].content.parts[0].text;
      
      // Parse the JSON response
      const suggestions = JSON.parse(resultText.replace(/```json|```/g, '').trim());

      return {
        data: suggestions,
        success: true
      };

    } catch (error: any) {
      console.error('getFoodSuggestions error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get food suggestions'
      };
    }
  }

  /**
   * Get detailed nutritional information for a specific food
   */
  static async getFoodNutrition(foodName: string): Promise<ApiResponse<any>> {
    try {
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: `Fornisci informazioni nutrizionali dettagliate per "${foodName}" per 100g.

Rispondi in formato JSON:
{
  "name": "${foodName}",
  "nutritionalValues": {
    "calories_per_100g": numero,
    "protein_per_100g": numero,
    "carbs_per_100g": numero, 
    "fats_per_100g": numero,
    "fiber_per_100g": numero,
    "sugar_per_100g": numero,
    "sodium_per_100g": numero
  },
  "description": "breve descrizione nutrizionale",
  "healthBenefits": ["beneficio1", "beneficio2", "beneficio3"]
}

IMPORTANTE: Usa valori nutrizionali reali e precisi per 100g del prodotto.`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 512,
        }
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const resultText = data.candidates[0].content.parts[0].text;
      
      const nutritionInfo = JSON.parse(resultText.replace(/```json|```/g, '').trim());

      return {
        data: nutritionInfo,
        success: true
      };

    } catch (error: any) {
      console.error('getFoodNutrition error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get food nutrition'
      };
    }
  }

  /**
   * Validate API key
   */
  static async validateApiKey(): Promise<boolean> {
    try {
      const testRequest = {
        contents: [
          {
            parts: [
              {
                text: "Test"
              }
            ]
          }
        ]
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testRequest)
      });

      return response.ok;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }
}

export default GeminiService;