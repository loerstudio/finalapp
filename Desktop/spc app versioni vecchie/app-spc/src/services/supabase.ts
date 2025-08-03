import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Supabase project credentials
// Project: xlyoszduijhqakfwzdys (visible in your screenshot)

const supabaseUrl = 'https://xlyoszduijhqakfwzdys.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhseW9zemR1aWpocWFrZnd6ZHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzYzMTIsImV4cCI6MjA2OTY1MjMxMn0.Upu08t7bFqpNnpNOHKk2M0U-i8C6CuRHeNl3AKlHgJk';

// Validation
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Please check your configuration.');
}

if (!supabaseUrl.includes('supabase.co')) {
  console.warn('⚠️ Warning: Supabase URL format may be incorrect');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'spc-fitness-app',
    },
  },
});

// Export for use in other files
export { supabaseUrl, supabaseAnonKey };

// Connection test on module load with correct table name
supabase.from('users').select('count').limit(1).then(
  (result) => {
    if (result.error) {
      console.error('🔴 Supabase connection failed:', result.error.message);
      console.log('💡 Check your Supabase configuration and ensure:');
      console.log('  - Project URL is correct');
      console.log('  - Anon key is valid');  
      console.log('  - Project is not paused');
      console.log('  - Database tables exist');
      console.log('  - RLS policies are configured');
    } else {
      console.log('🟢 Supabase connected successfully to database with tables:', 
                  'users, messages, foods, goals, workouts, etc.');
    }
  }
).catch((error) => {
  console.error('🔴 Supabase connection error:', error.message);
});