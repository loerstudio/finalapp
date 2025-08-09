import { createClient } from '@supabase/supabase-js';

// Supabase project URL and keys
export const SUPABASE_URL = 'https://nrvppxjsmyqjbnykkvxo.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ydnBweGpzbXlxamJueWtrdnhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MzgwMzAsImV4cCI6MjA2NjQxNDAzMH0.i0N6QDMDPAY3TAH8sGzo4U1rRPk8JxOiTm_36zGx9Kw';
// Service role key (for server-side/admin use only, do NOT expose in client)
// export const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ydnBweGpzbXlxamJueWtrdnhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDgzODAzMCwiZXhwIjoyMDY2NDE0MDMwfQ.bVQqrWznrZnuGZ0yLhpC2bc4VnDE1kkO23KArIreEss';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/*
SETUP INSTRUCTIONS:

1. Create a Supabase account at https://supabase.com/
2. Create a new project
3. Get your URL and anon key from the project settings > API
4. Replace the placeholder values above

DATABASE SETUP:
- Create tables for users, training data, and admin access
- Set up Row Level Security (RLS) policies for data protection

Example tables to create:
1. profiles (id, user_id, full_name, avatar_url, role)
2. training_sessions (id, user_id, date, notes, trainer_id)
3. measurements (id, user_id, date, weight, body_fat, etc.)
4. nutrition_logs (id, user_id, date, food_items, calories)
*/ 