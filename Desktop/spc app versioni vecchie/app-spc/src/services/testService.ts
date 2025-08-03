import { mockUsers, mockWorkoutPrograms, mockChatMessages, mockNutritionPlans } from './mockData';
import { User, WorkoutProgram, ChatMessage, NutritionPlan, Exercise, ProgressGoal, WorkoutSession, FoodLog, NutritionFood } from '../types';

export class TestService {
  // Simulate Appwrite responses
  static async getCurrentUser(): Promise<User | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return test user
    const testUser = mockUsers[0]; // Coach by default
    return {
      id: testUser.$id,
      email: testUser.email,
      first_name: testUser.prefs.first_name,
      last_name: testUser.prefs.last_name,
      role: testUser.prefs.role,
      avatar_url: testUser.prefs.avatar_url,
      phone: testUser.prefs.phone,
      is_verified: testUser.prefs.is_verified,
      specializations: testUser.prefs.specializations,
      created_at: testUser.$createdAt,
      updated_at: testUser.$updatedAt,
      has_nutrition_plan: true
    };
  }

  static async signIn(email: string, password: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email);
    if (!user) return null;
    
    return {
      id: user.$id,
      email: user.email,
      first_name: user.prefs.first_name,
      last_name: user.prefs.last_name,
      role: user.prefs.role,
      avatar_url: user.prefs.avatar_url,
      phone: user.prefs.phone,
      is_verified: user.prefs.is_verified,
      specializations: user.prefs.specializations,
      created_at: user.$createdAt,
      updated_at: user.$updatedAt,
      has_nutrition_plan: user.prefs.role === 'client'
    };
  }

  static async sendOTP(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('📧 OTP sent to:', email);
  }

  static async verifyOTP(email: string, token: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user exists, if not create new user (for pierino3@mail.com)
    let user = mockUsers.find(u => u.email === email);
    
    if (!user && email === 'pierino3@mail.com') {
      // Create new client user
      user = {
        $id: 'user-pierino',
        email: 'pierino3@mail.com',
        name: 'Pierino',
        prefs: {
          first_name: 'Pierino',
          last_name: 'Client',
          role: 'client',
          is_verified: true,
          specializations: [],
          has_nutrition_plan: true // Coach can choose this
        },
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString()
      };
    }
    
    if (!user) return null;
    
    return {
      id: user.$id,
      email: user.email,
      first_name: user.prefs.first_name,
      last_name: user.prefs.last_name,
      role: user.prefs.role,
      avatar_url: user.prefs.avatar_url,
      phone: user.prefs.phone,
      is_verified: user.prefs.is_verified,
      specializations: user.prefs.specializations,
      created_at: user.$createdAt,
      updated_at: user.$updatedAt,
      has_nutrition_plan: user.prefs.has_nutrition_plan || false
    };
  }

  // Coach creates client
  static async createClient(clientData: {
    email: string;
    first_name: string;
    last_name: string;
    has_nutrition_plan: boolean;
  }): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newClient: User = {
      id: `client-${Date.now()}`,
      email: clientData.email,
      first_name: clientData.first_name,
      last_name: clientData.last_name,
      role: 'client',
      avatar_url: '',
      phone: '',
      is_verified: false,
      specializations: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      has_nutrition_plan: clientData.has_nutrition_plan
    };
    
    console.log('✅ Client created:', newClient);
    return newClient;
  }

  // Get exercises from Evolution Fit
  static async getExercises(): Promise<Exercise[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: 'ex-1',
        name: 'Push-up',
        description: 'Classic push-up exercise',
        muscle_group: 'Chest',
        difficulty: 'Beginner',
        video_url: 'https://evolution-fit.com/exercises/push-up.mp4',
        instructions: 'Start in plank position, lower body, push back up',
        equipment: 'Bodyweight',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'ex-2',
        name: 'Squat',
        description: 'Bodyweight squat',
        muscle_group: 'Legs',
        difficulty: 'Beginner',
        video_url: 'https://evolution-fit.com/exercises/squat.mp4',
        instructions: 'Stand with feet shoulder-width, squat down, stand up',
        equipment: 'Bodyweight',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'ex-3',
        name: 'Pull-up',
        description: 'Pull-up exercise',
        muscle_group: 'Back',
        difficulty: 'Intermediate',
        video_url: 'https://evolution-fit.com/exercises/pull-up.mp4',
        instructions: 'Hang from bar, pull body up, lower down',
        equipment: 'Pull-up bar',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  // Coach creates workout program
  static async createWorkoutProgram(programData: {
    name: string;
    description: string;
    client_id: string;
    weeks: any[];
  }): Promise<WorkoutProgram> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newProgram: WorkoutProgram = {
      id: `program-${Date.now()}`,
      name: programData.name,
      description: programData.description,
      coach_id: 'user-1', // Current coach
      client_id: programData.client_id,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      weeks: programData.weeks
    };
    
    console.log('✅ Workout program created:', newProgram);
    return newProgram;
  }

  static async getWorkoutPrograms(userId: string): Promise<WorkoutProgram[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockWorkoutPrograms.map(program => ({
      id: program.$id,
      name: program.name,
      description: program.description,
      coach_id: program.coach_id,
      client_id: program.client_id,
      is_active: program.is_active,
      created_at: program.created_at,
      updated_at: program.updated_at,
      weeks: []
    }));
  }

  // Chat functionality
  static async getChatMessages(userId: string, otherUserId: string): Promise<ChatMessage[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockChatMessages.map(msg => ({
      id: msg.$id,
      sender_id: msg.sender_id,
      receiver_id: msg.receiver_id,
      message_type: msg.message_type,
      content: msg.content,
      created_at: msg.created_at,
      updated_at: msg.updated_at
    }));
  }

  static async sendMessage(messageData: {
    sender_id: string;
    receiver_id: string;
    content: string;
    message_type?: string;
  }): Promise<ChatMessage> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender_id: messageData.sender_id,
      receiver_id: messageData.receiver_id,
      message_type: messageData.message_type || 'text',
      content: messageData.content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('✅ Message sent:', newMessage);
    return newMessage;
  }

  // Nutrition functionality
  static async getNutritionPlans(userId: string): Promise<NutritionPlan[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockNutritionPlans.map(plan => ({
      id: plan.$id,
      name: plan.name,
      description: plan.description,
      coach_id: plan.coach_id,
      client_id: plan.client_id,
      daily_calories: plan.daily_calories,
      daily_protein: plan.daily_protein,
      daily_carbs: plan.daily_carbs,
      daily_fats: plan.daily_fats,
      is_active: plan.is_active,
      created_at: plan.created_at,
      updated_at: plan.updated_at,
      meals: []
    }));
  }

  static async createNutritionPlan(planData: {
    name: string;
    description: string;
    client_id: string;
    daily_calories: number;
    daily_protein: number;
    daily_carbs: number;
    daily_fats: number;
  }): Promise<NutritionPlan> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newPlan: NutritionPlan = {
      id: `plan-${Date.now()}`,
      name: planData.name,
      description: planData.description,
      coach_id: 'user-1', // Current coach
      client_id: planData.client_id,
      daily_calories: planData.daily_calories,
      daily_protein: planData.daily_protein,
      daily_carbs: planData.daily_carbs,
      daily_fats: planData.daily_fats,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      meals: []
    };
    
    console.log('✅ Nutrition plan created:', newPlan);
    return newPlan;
  }

  // Food scanning with Gemini AI
  static async scanFood(imageBase64: string): Promise<{
    isFood: boolean;
    food?: NutritionFood;
    error?: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate Gemini AI response
    const mockResponse = {
      isFood: true,
      food: {
        id: `food-${Date.now()}`,
        name: 'Petto di Pollo',
        calories_per_100g: 165,
        protein_per_100g: 31,
        carbs_per_100g: 0,
        fats_per_100g: 3.6,
        fiber_per_100g: 0,
        sugar_per_100g: 0,
        sodium_per_100g: 74,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    console.log('✅ Food scanned:', mockResponse);
    return mockResponse;
  }

  // Progress tracking
  static async createProgressGoal(goalData: {
    client_id: string;
    title: string;
    description: string;
    goal_type: string;
    start_value: number;
    target_value: number;
    target_date: string;
    unit: string;
  }): Promise<ProgressGoal> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newGoal: ProgressGoal = {
      id: `goal-${Date.now()}`,
      client_id: goalData.client_id,
      title: goalData.title,
      description: goalData.description,
      goal_type: goalData.goal_type,
      start_value: goalData.start_value,
      current_value: goalData.start_value,
      target_value: goalData.target_value,
      unit: goalData.unit,
      target_date: goalData.target_date,
      is_achieved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('✅ Progress goal created:', newGoal);
    return newGoal;
  }

  static async getProgressGoals(clientId: string): Promise<ProgressGoal[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: 'goal-1',
        client_id: clientId,
        title: 'Perdere 5kg',
        description: 'Obiettivo di perdita peso',
        goal_type: 'weight_loss',
        start_value: 75,
        current_value: 72,
        target_value: 70,
        unit: 'kg',
        target_date: '2025-06-01',
        is_achieved: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  // Live workout
  static async startWorkoutSession(clientId: string, programId: string): Promise<WorkoutSession> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      client_id: clientId,
      program_id: programId,
      started_at: new Date().toISOString(),
      completed_at: null,
      exercises: [],
      feedback: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('✅ Workout session started:', newSession);
    return newSession;
  }

  static async completeWorkoutSession(sessionId: string, feedback: {
    rating: number;
    feeling: string;
    performance: string;
  }): Promise<WorkoutSession> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const completedSession: WorkoutSession = {
      id: sessionId,
      client_id: 'user-pierino',
      program_id: 'program-1',
      started_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      completed_at: new Date().toISOString(),
      exercises: [],
      feedback: feedback,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('✅ Workout session completed:', completedSession);
    return completedSession;
  }

  static async checkUserExists(email: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockUsers.some(user => user.email === email);
  }
} 