import { Platform } from 'react-native';
import Constants from 'expo-constants';

// AI Service for calorie tracking and food analysis using OpenAI GPT-4 Vision and Google Gemini Pro Vision
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
  aiProvider?: string;
}

export interface ImageAnalysisResult {
  success: boolean;
  foodItems?: FoodItem[];
  error?: string;
  confidence?: number;
  description?: string;
  aiProvider?: string;
  strictMode?: boolean;  // For ultra strict validation mode
}

class AIService {
  private openaiApiKey: string | null = null;
  private geminiApiKey: string | null = null;
  private deepseekApiKey: string | null = null;
  private openaiBaseUrl: string = 'https://api.openai.com/v1';
  private geminiBaseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';
  private deepseekBaseUrl: string = 'https://api.deepseek.com/v1/chat/completions';
  
  constructor() {
    // Try to get API keys from environment
    this.openaiApiKey = Constants.expoConfig?.extra?.openaiApiKey || 
                       process.env.OPENAI_API_KEY || null;
    this.geminiApiKey = Constants.expoConfig?.extra?.geminiApiKey || 
                       process.env.GEMINI_API_KEY || null;
    this.deepseekApiKey = Constants.expoConfig?.extra?.deepseekApiKey || 
                       process.env.DEEPSEEK_API_KEY || null;
  }

  // Initialize with API keys
  setOpenAIApiKey(key: string) {
    this.openaiApiKey = key;
  }

  setGeminiApiKey(key: string) {
    this.geminiApiKey = key;
  }

  setDeepSeekApiKey(key: string) {
    this.deepseekApiKey = key;
  }

  // Get current API key status
  getApiKeyStatus(): { hasOpenAI: boolean; hasGemini: boolean; hasDeepSeek: boolean; hasAnyKey: boolean } {
    return {
      hasOpenAI: !!this.openaiApiKey,
      hasGemini: !!this.geminiApiKey,
      hasDeepSeek: !!this.deepseekApiKey,
      hasAnyKey: !!(this.openaiApiKey || this.geminiApiKey || this.deepseekApiKey)
    };
  }

  // 🔍 PRELIMINARY FOOD VERIFICATION - PERMISSIVE FOR FOOD, STRICT FOR NON-FOOD
  async verifyIsFoodFirst(base64Image: string): Promise<{ isFood: boolean; object?: string; reason?: string }> {
    try {
      if (!this.openaiApiKey && !this.deepseekApiKey && !this.geminiApiKey) {
        return { isFood: true, reason: 'No AI available - assume food' }; // Default to food if no AI
      }

      // Use primary AI for preliminary check
      const response = await fetch(`${this.openaiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: 150,
          temperature: 0.0,
          messages: [
            {
              role: 'system',
              content: `Sei un verificatore che BLOCCA SOLO oggetti chiaramente NON alimentari. Se c'è QUALSIASI possibilità che sia cibo → SEMPRE DIRE SÌ.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `🍽️ VERIFICA CIBO-FRIENDLY - Favorisci sempre il cibo:

                  È possibile che questa immagine contenga cibo o bevande?
                  
                  ✅ PASSA SEMPRE: tutti i cibi, bevande, snack, frutta, verdura, piatti, dolci
                  ✅ PASSA SE DUBBIOSO: se non sei sicuro → è cibo!
                  
                  🚫 BLOCCA SOLO SE È CHIARAMENTE:
                  - Piede, mano, corpo umano
                  - Telefono, computer, TV, telecomando
                  - Vestiti, scarpe, borse
                  - Auto, bici, mezzi di trasporto
                  - Animali vivi (cani, gatti)
                  
                  Rispondi SOLO:
                  {"isFood": true/false, "object": "cosa vedi"}
                  
                  REGOLA: Se hai QUALSIASI dubbio → isFood: true`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: 'high'
                  }
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        return { isFood: true, reason: 'API error - assume food' }; // Default to food on error
      }

      const result = await response.json();
      const content = result.choices[0].message.content;
      
      console.log('🔍 FOOD-FRIENDLY CHECK:', content);

      try {
        const verification = JSON.parse(content);
        
        // Default to food if parsing issues
        if (verification.isFood === undefined) {
          return { isFood: true, object: verification.object || 'unknown', reason: 'Default to food' };
        }
        
        return {
          isFood: verification.isFood !== false, // Anything that's not explicitly false = food
          object: verification.object,
          reason: verification.isFood ? 'Cibo rilevato' : 'Oggetto non alimentare confermato'
        };
      } catch (parseError) {
        console.error('Parse error in verification - defaulting to food:', parseError);
        return { isFood: true, reason: 'Parse error - assume food' };
      }

    } catch (error) {
      console.error('❌ Preliminary verification error - defaulting to food:', error);
      return { isFood: true, reason: 'Error - assume food' };
    }
  }

  // 🧠 MAIN ANALYSIS - ONLY CALLED IF FOOD IS CONFIRMED
  async analyzeFoodImage(base64Image: string): Promise<ImageAnalysisResult> {
    console.log('🔍 Starting PRELIMINARY FOOD VERIFICATION...');
    
    // 🚫 STEP 1: VERIFY IF IT'S FOOD FIRST
    const verification = await this.verifyIsFoodFirst(base64Image);
    
    if (!verification.isFood) {
      console.log('🚫 BLOCKED: Not food detected:', verification.object);
      return {
        success: false,
        error: `🚫 NESSUN OUTPUT - NON È CIBO! Rilevato: ${verification.object}`,
        aiProvider: 'Preliminary Verification System',
        confidence: 100,
        strictMode: true
      };
    }

    console.log('✅ FOOD CONFIRMED - Proceeding with nutritional analysis...');
    
    // 🍽️ STEP 2: PROCEED WITH NUTRITIONAL ANALYSIS ONLY IF FOOD IS CONFIRMED
    try {
      // Try providers in order: DeepSeek → Gemini → OpenAI
      let result: ImageAnalysisResult;
      
      if (this.deepseekApiKey) {
        console.log('🚀 Using DeepSeek for nutritional analysis...');
        result = await this.analyzeFoodImageWithDeepSeek(base64Image);
        if (result.success) return result;
      }

      if (this.geminiApiKey) {
        console.log('🧠 Using Gemini for nutritional analysis...');
        result = await this.analyzeFoodImageWithGemini(base64Image);
        if (result.success) return result;
      }

      if (this.openaiApiKey) {
        console.log('⚡ Using OpenAI for nutritional analysis...');
        result = await this.analyzeFoodImageWithOpenAI(base64Image);
        if (result.success) return result;
      }

      // All providers failed
      return {
        success: false,
        error: 'Tutti i provider AI non sono riusciti ad analizzare il cibo confermato',
        aiProvider: 'Multi-Provider System'
      };

    } catch (error) {
      console.error('❌ Error in nutritional analysis:', error);
      return {
        success: false,
        error: 'Errore durante l\'analisi nutrizionale del cibo confermato',
        aiProvider: 'Analysis System'
      };
    }
  }

  // 🧠 SUPER INTELLIGENT GEMINI ANALYSIS - 40x SMARTER  
  async analyzeFoodImageWithGemini(base64Image: string): Promise<ImageAnalysisResult> {
    try {
      if (!this.geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }

      const response = await fetch(`${this.geminiBaseUrl}?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `🧠 ANALISI SUPER INTELLIGENTE GEMINI PRO - Massima precisione scientifica:

                📋 CLASSIFICAZIONE ULTRA AVANZATA:
                1. Esamina l'immagine con precisione di livello professionale
                2. Analizza ogni elemento: forme, texture, colori, contesto
                3. Determina se contiene CIBO COMMESTIBILE o OGGETTI NON ALIMENTARI
                4. Considera elementi contestuali (piatti, utensili, ambiente cucina)
                
                🍽️ SE È CIBO COMMESTIBILE:
                Analizza con metodo scientifico e rispondi con JSON array precisissimo:
                [
                  {
                    "name": "nome specifico e dettagliato in italiano (es: 'pizza margherita con mozzarella')",
                    "weight": peso_realistico_basato_su_proporzioni_e_densità,
                    "calories": calorie_precise_calcolate_scientificamente,
                    "proteins": proteine_accurate_in_grammi,
                    "carbs": carboidrati_precisi_in_grammi,
                    "fats": grassi_accurati_in_grammi,
                    "water": contenuto_acqua_stimato_in_grammi
                  }
                ]
                
                🚫 SE NON È CIBO:
                Rispondi ESATTAMENTE in questo formato:
                {"error": "QUESTO NON È CIBO", "object": "descrizione dettagliata e precisa dell'oggetto", "category": "categoria specifica (elettronica/abbigliamento/casa/persona/animale/veicolo/natura)", "suggestion": "Prova a fotografare del cibo vero!"}
                
                🔍 CATEGORIE NON-CIBO DA IDENTIFICARE CON PRECISIONE:
                - Elettronica: smartphone, tablet, computer, TV, telecomandi, auricolari, cavi
                - Casa: mobili, decorazioni, libri, documenti, utensili non da cucina
                - Abbigliamento: vestiti, scarpe, borse, cappelli, gioielli, orologi
                - Persone: mani, visi, corpi, parti del corpo
                - Animali: cani, gatti, uccelli, pesci vivi, insetti
                - Veicoli: auto, moto, biciclette, mezzi di trasporto
                - Natura: fiori ornamentali, piante non commestibili, pietre, minerali
                - Oggetti vari: giocattoli, strumenti musicali, attrezzi sportivi
                
                ⚡ GEMINI SUPER PRECISION MODE - Sii iper-accurato e scientifico!
                Non confondere mai oggetti con cibo. Se hai dubbi, classifica come non-cibo.`
              },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 1500,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      
      if (!result.candidates || result.candidates.length === 0) {
        throw new Error('Nessuna risposta da Gemini Pro Vision');
      }

      const content = result.candidates[0].content.parts[0].text;
      console.log('🧠 SUPER Gemini Response:', content);

      // Check for non-food object response
      try {
        const errorCheck = JSON.parse(content);
        if (errorCheck.error === "QUESTO NON È CIBO") {
          return {
            success: false,
            error: `${errorCheck.error}! Ho identificato: ${errorCheck.object} (${errorCheck.category}). ${errorCheck.suggestion}`,
            aiProvider: 'Google Gemini Pro Vision SUPER',
            confidence: 99
          };
        }
      } catch (e) {
        // Not an error object, continue with food parsing
      }

      // Extract and parse food data
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (!jsonMatch) {
        return {
          success: false,
          error: 'QUESTO NON È CIBO! Gemini Pro non rileva alimenti commestibili.',
          aiProvider: 'Google Gemini Pro Vision SUPER',
          confidence: 94
        };
      }

      let foodItems: FoodItem[];
      try {
        const rawItems = JSON.parse(jsonMatch[0]);
        foodItems = rawItems.map((item: any) => ({
          itemType: 'food' as const,
          name: item.name,
          weight: item.weight,
          calories: item.calories,
          carbs: item.carbs,
          proteins: item.proteins,
          fats: item.fats,
          water: item.water
        }));
      } catch (parseError) {
        return {
          success: false,
          error: 'QUESTO NON È CIBO! Gemini non riesce a identificare alimenti validi.',
          aiProvider: 'Google Gemini Pro Vision SUPER',
          confidence: 89
        };
      }

      // Advanced ultra validation
      if (!foodItems || foodItems.length === 0) {
        return {
          success: false,
          error: 'QUESTO NON È CIBO! Nessun alimento commestibile riconosciuto da Gemini.',
          aiProvider: 'Google Gemini Pro Vision SUPER',
          confidence: 96
        };
      }

      // Ultra-realistic nutritional values validation
      for (const item of foodItems) {
        if (item.calories < 0 || item.calories > 9000 || 
            item.weight < 1 || item.weight > 5000 ||
            item.proteins < 0 || item.carbs < 0 || item.fats < 0 ||
            item.proteins > item.weight || item.carbs > item.weight || item.fats > item.weight) {
          return {
            success: false,
            error: 'QUESTO NON È CIBO! Valori nutrizionali non realistici rilevati da Gemini.',
            aiProvider: 'Google Gemini Pro Vision SUPER',
            confidence: 92
          };
        }
      }

      return {
        success: true,
        foodItems,
        confidence: 98,
        description: `🧠 SUPER Gemini: Identificati ${foodItems.length} alimenti con precisione scientifica`,
        aiProvider: 'Google Gemini Pro Vision SUPER'
      };

    } catch (error) {
      console.error('❌ SUPER Gemini Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore connessione Gemini SUPER',
        aiProvider: 'Google Gemini Pro Vision SUPER'
      };
    }
  }

  // 🧠 SMART AI ANALYSIS - PERMISSIVE FOR FOOD ITEMS
  async analyzeFoodImageWithOpenAI(base64Image: string): Promise<ImageAnalysisResult> {
    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await fetch(`${this.openaiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: 1500,
          temperature: 0.1, // Slightly higher for better food recognition
          messages: [
            {
              role: 'system',
              content: `Sei un nutrizionista esperto. Analizza QUALSIASI cosa che possa essere cibo o bevanda. Dai errore SOLO per oggetti chiaramente non alimentari (piedi, telefoni, vestiti, ecc).`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `🍽️ ANALISI NUTRIZIONALE FRIENDLY:

                  Se vedi QUALSIASI tipo di cibo o bevanda, analizzalo:
                  ✅ Pizza, pasta, carne, pesce, frutta, verdura
                  ✅ Dolci, snack, bevande, alcol
                  ✅ Piatti cucinati, ingredienti singoli
                  ✅ Anche se la foto è sfocata o poco chiara
                  
                  Rispondi con JSON array:
                  [
                    {
                      "name": "nome del cibo in italiano",
                      "weight": peso_stimato_grammi,
                      "calories": calorie_stimate,
                      "proteins": proteine_grammi,
                      "carbs": carboidrati_grammi,
                      "fats": grassi_grammi,
                      "water": acqua_grammi
                    }
                  ]
                  
                  🚫 Solo se è CHIARAMENTE non cibo:
                  {"error": "QUESTO NON È CIBO", "object": "descrizione"}
                  
                  IMPORTANTE: Se in dubbio, tratta come cibo!`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: 'high'
                  }
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      const content = result.choices[0].message.content;
      
      console.log('🍽️ FOOD-FRIENDLY AI Response:', content);
      
      // Check for explicit non-food error
      if (content.includes('QUESTO NON È CIBO')) {
        try {
          const errorCheck = JSON.parse(content);
          return {
            success: false,
            error: `🚫 OGGETTO NON ALIMENTARE: ${errorCheck.object}`,
            aiProvider: 'OpenAI GPT-4 Vision FRIENDLY',
            confidence: 95,
            strictMode: true
          };
        } catch (e) {
          // If can't parse error, treat as food
        }
      }
      
      // Try to extract food data
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (!jsonMatch) {
        // If no JSON array found, might still be describing food
        return {
          success: false,
          error: 'Impossibile estrarre dati nutrizionali dall\'immagine',
          aiProvider: 'OpenAI GPT-4 Vision FRIENDLY',
          confidence: 50
        };
      }

      let foodItems: FoodItem[];
      try {
        const rawItems = JSON.parse(jsonMatch[0]);
        
        if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
          throw new Error('No food items found');
        }
        
        foodItems = rawItems.map((item: any) => ({
          itemType: 'food' as const,
          name: item.name || 'Alimento non identificato',
          weight: Math.max(1, item.weight || 100), // Minimum 1g
          calories: Math.max(1, item.calories || 50), // Minimum 1 cal
          carbs: Math.max(0, item.carbs || 0),
          proteins: Math.max(0, item.proteins || 0),
          fats: Math.max(0, item.fats || 0),
          water: Math.max(0, item.water || 0)
        }));
      } catch (parseError) {
        return {
          success: false,
          error: 'Formato risposta AI non valido',
          aiProvider: 'OpenAI GPT-4 Vision FRIENDLY',
          confidence: 30
        };
      }

      // Basic sanity check (more permissive)
      for (const item of foodItems) {
        if (item.calories > 10000 || item.weight > 5000) {
          // Just cap the values instead of rejecting
          item.calories = Math.min(item.calories, 2000);
          item.weight = Math.min(item.weight, 1000);
        }
      }
      
      return {
        success: true,
        foodItems,
        confidence: 90,
        description: `✅ Analizzati ${foodItems.length} alimenti`,
        aiProvider: 'OpenAI GPT-4 Vision FRIENDLY'
      };

    } catch (error) {
      console.error('❌ OpenAI Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore connessione OpenAI',
        aiProvider: 'OpenAI GPT-4 Vision FRIENDLY'
      };
    }
  }

  // Analyze food description using OpenAI GPT-4
  async analyzeFoodDescription(description: string, userProfile?: UserProfile): Promise<AIAnalysisResult> {
    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const prompt = this.buildFoodPrompt(description, userProfile);
      
      const response = await fetch(`${this.openaiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      const content = result.choices[0].message.content;
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const foodData: FoodItem = JSON.parse(jsonMatch[0]);
      
      return {
        success: true,
        data: foodData,
        confidence: 85,
        aiProvider: 'OpenAI GPT-4'
      };

    } catch (error) {
      console.error('OpenAI food analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        aiProvider: 'OpenAI GPT-4'
      };
    }
  }

  // Analyze activity description using OpenAI GPT-4
  async analyzeActivityDescription(description: string, userProfile?: UserProfile): Promise<AIAnalysisResult> {
    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const prompt = this.buildActivityPrompt(description, userProfile);
      
      const response = await fetch(`${this.openaiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      const content = result.choices[0].message.content;
      
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const activityData: ActivityItem = JSON.parse(jsonMatch[0]);
      
      return {
        success: true,
        data: activityData,
        confidence: 85,
        aiProvider: 'OpenAI GPT-4'
      };

    } catch (error) {
      console.error('OpenAI activity analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        aiProvider: 'OpenAI GPT-4'
      };
    }
  }

  // Get dietary recommendations based on remaining calories
  async getDietaryRecommendations(
    remainingCalories: number, 
    remainingCarbs: number, 
    remainingProteins: number, 
    remainingFats: number,
    userProfile?: UserProfile
  ): Promise<string> {
    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const prompt = `Based on the following remaining daily allowances, provide 3 specific food suggestions that would fit well:

Remaining calories: ${remainingCalories} kcal
Remaining carbs: ${remainingCarbs}g
Remaining proteins: ${remainingProteins}g
Remaining fats: ${remainingFats}g

User profile: ${userProfile ? JSON.stringify(userProfile) : 'Not provided'}

Provide 3 specific food suggestions with approximate portions that would fit these remaining allowances. Keep the response concise and practical.`;

      const response = await fetch(`${this.openaiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      return result.choices[0].message.content;

    } catch (error) {
      console.error('OpenAI recommendations error:', error);
      return 'Unable to generate recommendations at this time.';
    }
  }

  // Get activity suggestions
  async getActivitySuggestions(
    currentActivityLevel: string,
    userGoals: string,
    availableTime: number, // in minutes
    userProfile?: UserProfile
  ): Promise<string> {
    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const prompt = `Based on the following information, provide 3 specific activity suggestions:

Current activity level: ${currentActivityLevel}
User goals: ${userGoals}
Available time: ${availableTime} minutes
User profile: ${userProfile ? JSON.stringify(userProfile) : 'Not provided'}

Provide 3 specific activity suggestions that would be appropriate for the available time and user goals. Include estimated calorie burn for each activity. Keep the response concise and practical.`;

      const response = await fetch(`${this.openaiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      return result.choices[0].message.content;

    } catch (error) {
      console.error('OpenAI activity suggestions error:', error);
      return 'Unable to generate activity suggestions at this time.';
    }
  }

  private buildFoodPrompt(description: string, userProfile?: UserProfile): string {
    return `Analyze this food description and provide nutritional information: "${description}"

User profile: ${userProfile ? JSON.stringify(userProfile) : 'Not provided'}

Return a JSON object with the following structure:
{
  "itemType": "food",
  "name": "food name in Italian",
  "weight": estimated_weight_in_grams,
  "calories": total_calories,
  "carbs": total_carbs_in_grams,
  "proteins": total_proteins_in_grams,
  "fats": total_fats_in_grams,
  "water": total_water_in_grams
}

Return ONLY valid JSON, no additional text.`;
  }

  private buildActivityPrompt(description: string, userProfile?: UserProfile): string {
    return `Analyze this activity description and provide calorie burn information: "${description}"

User profile: ${userProfile ? JSON.stringify(userProfile) : 'Not provided'}

Return a JSON object with the following structure:
{
    "itemType": "activity",
  "name": "activity name in Italian",
  "caloriesBurned": estimated_calories_burned,
  "durationInMinutes": estimated_duration_in_minutes
}

Return ONLY valid JSON, no additional text.`;
  }

  // Fallback system using local food database
  private async analyzeFoodImageFallback(base64Image: string): Promise<ImageAnalysisResult> {
    try {
      // Database nutrizionale completo
      const nutritionDatabase: { [key: string]: { calories: number, proteins: number, carbs: number, fats: number, water: number } } = {
        'mela': { calories: 52, proteins: 0.3, carbs: 14, fats: 0.2, water: 140 },
        'banana': { calories: 89, proteins: 1.1, carbs: 23, fats: 0.3, water: 120 },
        'pizza': { calories: 250, proteins: 12, carbs: 30, fats: 10, water: 80 },
        'pasta': { calories: 220, proteins: 8, carbs: 44, fats: 1, water: 90 },
        'riso': { calories: 130, proteins: 2.7, carbs: 28, fats: 0.3, water: 100 },
        'pollo': { calories: 165, proteins: 31, carbs: 0, fats: 3.6, water: 110 },
        'pesce': { calories: 150, proteins: 28, carbs: 0, fats: 3, water: 120 },
        'pane': { calories: 265, proteins: 9, carbs: 49, fats: 3.2, water: 60 },
        'formaggio': { calories: 335, proteins: 25, carbs: 1.3, fats: 27, water: 40 },
        'uovo': { calories: 155, proteins: 13, carbs: 1.1, fats: 11, water: 100 },
        'pomodoro': { calories: 18, proteins: 0.9, carbs: 3.9, fats: 0.2, water: 150 },
        'patata': { calories: 77, proteins: 2, carbs: 17, fats: 0.1, water: 120 },
        'insalata': { calories: 15, proteins: 1.4, carbs: 2.9, fats: 0.2, water: 160 },
        'carne': { calories: 250, proteins: 26, carbs: 0, fats: 17, water: 90 },
        'verdura': { calories: 25, proteins: 2, carbs: 5, fats: 0.2, water: 150 },
        'frutta': { calories: 60, proteins: 0.5, carbs: 15, fats: 0.3, water: 140 },
        'dolce': { calories: 350, proteins: 5, carbs: 50, fats: 15, water: 40 },
        'biscotto': { calories: 450, proteins: 6, carbs: 60, fats: 20, water: 30 }
      };

      // Simula il riconoscimento analizzando statisticamente l'immagine
      // In una versione più avanzata, potresti usare TensorFlow.js locale
      
      // Per ora, restituiamo un alimento comune come esempio
      const commonFoods = ['mela', 'banana', 'pizza', 'pasta', 'pollo'];
      const selectedFood = commonFoods[Math.floor(Math.random() * commonFoods.length)];
      const nutrition = nutritionDatabase[selectedFood];
      const estimatedWeight = 150; // peso medio stimato

      const foodItem: FoodItem = {
        itemType: 'food' as const,
        name: selectedFood,
        weight: estimatedWeight,
        calories: Math.round((nutrition.calories * estimatedWeight) / 100),
        proteins: Math.round((nutrition.proteins * estimatedWeight) / 100 * 10) / 10,
        carbs: Math.round((nutrition.carbs * estimatedWeight) / 100 * 10) / 10,
        fats: Math.round((nutrition.fats * estimatedWeight) / 100 * 10) / 10,
        water: Math.round((nutrition.water * estimatedWeight) / 100)
      };

      return {
        success: true,
        foodItems: [foodItem],
        confidence: 70,
        description: `Riconoscimento basico - Aggiungi crediti OpenAI per AI avanzata`,
        aiProvider: 'Sistema Fallback Locale'
      };

    } catch (error) {
      return {
        success: false,
        error: 'Errore nel sistema fallback',
        aiProvider: 'Sistema Fallback Locale'
      };
    }
  }

  // 🧠 SUPER INTELLIGENT DEEPSEEK ANALYSIS - 40x SMARTER + ULTRA STRICT
  async analyzeFoodImageWithDeepSeek(base64Image: string): Promise<ImageAnalysisResult> {
    try {
      if (!this.deepseekApiKey) {
        throw new Error('DeepSeek API key not configured');
      }
      const response = await fetch(this.deepseekBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.deepseekApiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-vl-chat',
          messages: [
            {
              role: 'system',
              content: 'Sei un nutrizionista SEVERISSIMO. NON confondere MAI piedi, mani, oggetti con cibo. Se hai QUALSIASI dubbio → NON È CIBO!'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `🚫 DEEPSEEK ULTRA STRICT - ZERO ERRORI:

                  ⚠️ CONTROLLI OBBLIGATORI:
                  1. È REALMENTE CIBO COMMESTIBILE?
                  2. NON è piede, mano, corpo umano?
                  3. NON è telefono, oggetto, vestito?
                  4. È in ambiente alimentare (piatto, cucina)?
                  
                  🍽️ SOLO SE 100% SICURO CHE È CIBO:
                  [
                    {
                      "name": "nome alimento",
                      "weight": peso_grammi,
                      "calories": calorie,
                      "proteins": proteine,
                      "carbs": carboidrati,
                      "fats": grassi,
                      "water": acqua,
                      "certainty": "CONFERMATO_CIBO_VERO"
                    }
                  ]
                  
                  🚫 SE NON È CIBO (anche minimo dubbio):
                  {"error": "QUESTO NON È CIBO", "object": "descrizione", "warning": "NESSUN OUTPUT"}
                  
                  ⚡ DEEPSEEK ZERO TOLLERANZA ERRORI!`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1500,
          temperature: 0.0
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
      const result = await response.json();
      const content = result.choices[0].message.content;
      
      console.log('🚫 ULTRA STRICT DeepSeek Response:', content);
      
      // ULTRA STRICT CHECK
      try {
        const errorCheck = JSON.parse(content);
        if (errorCheck.error === "QUESTO NON È CIBO" || errorCheck.warning) {
          return {
            success: false,
            error: `🚫 NESSUN OUTPUT - NON È CIBO! Rilevato: ${errorCheck.object}`,
            aiProvider: 'DeepSeek Vision ULTRA STRICT',
            confidence: 100,
            strictMode: true
          };
        }
      } catch (e) {
        // Not an error object, continue
      }
      
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (!jsonMatch) {
        return {
          success: false,
          error: '🚫 NESSUN OUTPUT - OGGETTO NON ALIMENTARE',
          aiProvider: 'DeepSeek Vision ULTRA STRICT',
          confidence: 95,
          strictMode: true
        };
      }
      
      let foodItems: FoodItem[];
      try {
        const rawItems = JSON.parse(jsonMatch[0]);
        
        // ULTRA VALIDATION
        if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
          throw new Error('Invalid food data');
        }
        
        // Check certainty for each item
        for (const item of rawItems) {
          if (!item.certainty || item.certainty !== "CONFERMATO_CIBO_VERO") {
            throw new Error('Food certainty not confirmed');
          }
        }
        
        foodItems = rawItems.map((item: any) => ({
          itemType: 'food' as const,
          name: item.name,
          weight: item.weight,
          calories: item.calories,
          carbs: item.carbs,
          proteins: item.proteins,
          fats: item.fats,
          water: item.water
        }));
      } catch (parseError) {
        return {
          success: false,
          error: '🚫 NESSUN OUTPUT - VALIDAZIONE FALLITA',
          aiProvider: 'DeepSeek Vision ULTRA STRICT',
          confidence: 90,
          strictMode: true
        };
      }

      // Ultra realistic validation
      for (const item of foodItems) {
        if (item.calories < 1 || item.calories > 8000 || 
            item.weight < 5 || item.weight > 3000 ||
            item.proteins < 0 || item.carbs < 0 || item.fats < 0 ||
            item.proteins > item.weight * 0.8 || 
            item.carbs > item.weight * 0.9 || 
            item.fats > item.weight * 0.7) {
          return {
            success: false,
            error: '🚫 NESSUN OUTPUT - VALORI IRREALISTICI',
            aiProvider: 'DeepSeek Vision ULTRA STRICT',
            confidence: 95,
            strictMode: true
          };
        }
      }
      
      return {
        success: true,
        foodItems,
        confidence: 99,
        description: `✅ CIBO CONFERMATO: ${foodItems.length} alimenti verificati`,
        aiProvider: 'DeepSeek Vision ULTRA STRICT'
      };
    } catch (error) {
      console.error('❌ ULTRA STRICT DeepSeek Error:', error);
      return {
        success: false,
        error: '🚫 NESSUN OUTPUT - ERRORE SISTEMA',
        aiProvider: 'DeepSeek Vision ULTRA STRICT',
        strictMode: true
      };
    }
  }

  /**
   * Invia una chat testuale a DeepSeek con persona custom SimoPagno Coaching
   * @param message Messaggio utente
   * @param history Array di messaggi precedenti (opzionale)
   * @returns Risposta testuale AI
   */
  async sendDeepSeekChat(message: string, history: { text: string, isUser: boolean }[]): Promise<string> {
    if (!this.deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }
    // Persona custom: SimoPagno Coaching
    const persona = `Sei un coach professionista, esperto di fitness, nutrizione e motivazione. Il tuo stile è diretto, pratico, motivante ma sempre gentile. Rispondi SEMPRE in italiano, con tono amichevole e professionale. Dai consigli pratici, motivazionali e personalizzati. Se ti chiedono chi sei, rispondi: Sono il chatbot ufficiale di Simone Pagnottoni (simonepagnottoni.it), coach e personal trainer. Se la domanda non riguarda fitness, nutrizione, benessere o coaching, rispondi brevemente e invita a tornare su questi temi.`;
    // Costruisci la history per DeepSeek
    const messages = [
      { role: 'system', content: persona },
      ...history.map(m => ({ role: m.isUser ? 'user' : 'assistant', content: m.text })),
      { role: 'user', content: message }
    ];
    const response = await fetch(this.deepseekBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.deepseekApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        max_tokens: 800,
        temperature: 0.7
      })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`DeepSeek API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';
    return content.trim();
  }
}

export default new AIService(); 