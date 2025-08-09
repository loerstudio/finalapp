import { FoodItem, NutritionInfo } from '@/types/food';

const DEEPSEEK_API_BASE = 'https://api.deepseek.com/v1';

interface DeepseekVisionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface DeepseekChatResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export const analyzeFood = async (imageUri: string): Promise<FoodItem[]> => {
  try {
    // Convert image to base64 for API
    const base64Image = await convertImageToBase64(imageUri);
    
    // Step 1: Use Vision model to identify foods
    const visionResponse = await fetch(`${DEEPSEEK_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-vl2',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this food image and identify all food items with their estimated quantities. Be specific about portion sizes and types of food. Return only the food identification, no nutritional analysis yet.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    const visionData: DeepseekVisionResponse = await visionResponse.json();
    const foodDescription = visionData.choices[0].message.content;

    // Step 2: Use Chat model to get nutritional breakdown
    const nutritionResponse = await fetch(`${DEEPSEEK_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a nutrition expert. Given a description of food items, provide detailed nutritional information in JSON format.',
          },
          {
            role: 'user',
            content: `Based on this food description: "${foodDescription}", provide nutritional information for each food item in the following JSON format:
            
            {
              "foods": [
                {
                  "name": "Food name",
                  "quantity": "Estimated portion size",
                  "nutrition": {
                    "calories": number,
                    "protein": number,
                    "sugar": number,
                    "fat": number
                  },
                  "confidence": number (0-1)
                }
              ]
            }
            
            Be as accurate as possible with standard nutritional databases. Return only the JSON, no additional text.`,
          },
        ],
        max_tokens: 1500,
      }),
    });

    const nutritionData: DeepseekChatResponse = await nutritionResponse.json();
    const nutritionContent = nutritionData.choices[0].message.content;
    
    // Parse the JSON response
    const parsedData = JSON.parse(nutritionContent);
    
    return parsedData.foods.map((food: any) => ({
      id: generateId(),
      name: food.name,
      quantity: food.quantity,
      nutrition: food.nutrition,
      confidence: food.confidence || 0.8,
    }));
    
  } catch (error) {
    console.error('Error analyzing food:', error);
    // Return mock data for demo purposes
    return getMockFoodData();
  }
};

const convertImageToBase64 = async (imageUri: string): Promise<string> => {
  // For demo purposes, return a placeholder
  // In production, you'd convert the actual image to base64
  return 'placeholder-base64-data';
};

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

const getMockFoodData = (): FoodItem[] => {
  return [
    {
      id: generateId(),
      name: 'Grilled Chicken Breast',
      quantity: '150g',
      nutrition: {
        calories: 231,
        protein: 43.5,
        sugar: 0,
        fat: 5.1,
      },
      confidence: 0.9,
    },
    {
      id: generateId(),
      name: 'Brown Rice',
      quantity: '100g',
      nutrition: {
        calories: 111,
        protein: 2.6,
        sugar: 0.4,
        fat: 0.9,
      },
      confidence: 0.85,
    },
    {
      id: generateId(),
      name: 'Steamed Broccoli',
      quantity: '80g',
      nutrition: {
        calories: 27,
        protein: 2.4,
        sugar: 1.2,
        fat: 0.3,
      },
      confidence: 0.88,
    },
  ];
};