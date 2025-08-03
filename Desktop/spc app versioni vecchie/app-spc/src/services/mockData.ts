// Mock data for Appwrite testing
export const mockUsers = [
  {
    $id: 'user-1',
    email: 'coach@spc.com',
    name: 'Coach SPC',
    prefs: {
      first_name: 'Coach',
      last_name: 'SPC',
      role: 'coach',
      is_verified: true,
      specializations: ['Fitness', 'Nutrition']
    },
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString()
  },
  {
    $id: 'user-2',
    email: 'itsilorenz07@gmail.com',
    name: 'Lorenzo',
    prefs: {
      first_name: 'Lorenzo',
      last_name: 'Client',
      role: 'client',
      is_verified: true,
      specializations: []
    },
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString()
  }
];

export const mockWorkoutPrograms = [
  {
    $id: 'program-1',
    name: 'Programma Base',
    description: 'Programma di allenamento per principianti',
    coach_id: 'user-1',
    client_id: 'user-2',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockChatMessages = [
  {
    $id: 'msg-1',
    sender_id: 'user-1',
    receiver_id: 'user-2',
    message_type: 'text',
    content: 'Ciao! Come va l\'allenamento?',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    $id: 'msg-2',
    sender_id: 'user-2',
    receiver_id: 'user-1',
    message_type: 'text',
    content: 'Tutto bene! Ho completato il workout di oggi',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockNutritionPlans = [
  {
    $id: 'plan-1',
    name: 'Piano Nutrizionale Base',
    description: 'Piano alimentare equilibrato',
    coach_id: 'user-1',
    client_id: 'user-2',
    daily_calories: 2000,
    daily_protein: 150,
    daily_carbs: 200,
    daily_fats: 70,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];