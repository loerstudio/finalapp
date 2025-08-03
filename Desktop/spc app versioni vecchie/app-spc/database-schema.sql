-- SPC Fitness - Complete Database Schema
-- This schema supports the full workout and nutrition tracking app

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('client', 'coach')),
    avatar_url TEXT,
    phone TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    specializations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Clients table (relationship between coach and client)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    coach_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    has_nutrition_plan BOOLEAN DEFAULT FALSE,
    subscription_type TEXT CHECK (subscription_type IN ('basic', 'premium')) DEFAULT 'basic',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    goals TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, coach_id)
);

-- Exercises library
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    muscle_groups TEXT[] NOT NULL,
    equipment TEXT[] DEFAULT '{}',
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
    video_url TEXT,
    evolution_fit_id TEXT,
    instructions TEXT[] DEFAULT '{}',
    tips TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Workout programs
CREATE TABLE IF NOT EXISTS public.workout_programs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    coach_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Workout weeks
CREATE TABLE IF NOT EXISTS public.workout_weeks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    program_id UUID REFERENCES public.workout_programs(id) ON DELETE CASCADE NOT NULL,
    week_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(program_id, week_number)
);

-- Workout days
CREATE TABLE IF NOT EXISTS public.workout_days (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    week_id UUID REFERENCES public.workout_weeks(id) ON DELETE CASCADE NOT NULL,
    day_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    muscle_groups TEXT[] DEFAULT '{}',
    rest_day BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(week_id, day_number)
);

-- Workout exercises (exercises within a workout day)
CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    day_id UUID REFERENCES public.workout_days(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER NOT NULL,
    sets INTEGER NOT NULL DEFAULT 3,
    reps TEXT NOT NULL DEFAULT '10',
    weight DECIMAL(5,2),
    rest_seconds INTEGER DEFAULT 60,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Workout sessions (when a client performs a workout)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    program_id UUID REFERENCES public.workout_programs(id) ON DELETE CASCADE NOT NULL,
    week_id UUID REFERENCES public.workout_weeks(id) ON DELETE CASCADE NOT NULL,
    day_id UUID REFERENCES public.workout_days(id) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('in_progress', 'completed', 'skipped')) DEFAULT 'in_progress',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Workout session exercises (actual performance data)
CREATE TABLE IF NOT EXISTS public.workout_session_exercises (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
    sets_completed JSONB DEFAULT '[]',
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Workout feedback
CREATE TABLE IF NOT EXISTS public.workout_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL UNIQUE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    feeling TEXT CHECK (feeling IN ('terrible', 'bad', 'okay', 'good', 'amazing')) NOT NULL,
    effort_level INTEGER CHECK (effort_level >= 1 AND effort_level <= 10) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Nutrition foods
CREATE TABLE IF NOT EXISTS public.nutrition_foods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    calories_per_100g DECIMAL(6,2) NOT NULL,
    protein_per_100g DECIMAL(5,2) NOT NULL DEFAULT 0,
    carbs_per_100g DECIMAL(5,2) NOT NULL DEFAULT 0,
    fats_per_100g DECIMAL(5,2) NOT NULL DEFAULT 0,
    fiber_per_100g DECIMAL(5,2) DEFAULT 0,
    sugar_per_100g DECIMAL(5,2) DEFAULT 0,
    sodium_per_100g DECIMAL(6,2) DEFAULT 0,
    barcode TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Nutrition plans
CREATE TABLE IF NOT EXISTS public.nutrition_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    coach_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    daily_calories INTEGER NOT NULL,
    daily_protein DECIMAL(6,2) NOT NULL,
    daily_carbs DECIMAL(6,2) NOT NULL,
    daily_fats DECIMAL(6,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Nutrition meals
CREATE TABLE IF NOT EXISTS public.nutrition_meals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    plan_id UUID REFERENCES public.nutrition_plans(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
    target_calories INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Food logs (client's actual food intake)
CREATE TABLE IF NOT EXISTS public.food_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    food_id UUID REFERENCES public.nutrition_foods(id) ON DELETE CASCADE NOT NULL,
    quantity_grams DECIMAL(7,2) NOT NULL,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Food scans (AI-powered food recognition)
CREATE TABLE IF NOT EXISTS public.food_scans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    scan_result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'image', 'workout_share', 'nutrition_share')) DEFAULT 'text',
    content TEXT NOT NULL,
    image_url TEXT,
    metadata JSONB DEFAULT '{}',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Progress goals
CREATE TABLE IF NOT EXISTS public.progress_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    goal_type TEXT CHECK (goal_type IN ('weight_loss', 'weight_gain', 'muscle_gain', 'strength', 'endurance', 'custom')) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_value DECIMAL(8,2) NOT NULL,
    current_value DECIMAL(8,2) DEFAULT 0,
    unit TEXT NOT NULL,
    target_date DATE NOT NULL,
    is_achieved BOOLEAN DEFAULT FALSE,
    before_photo TEXT,
    after_photo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Progress updates
CREATE TABLE IF NOT EXISTS public.progress_updates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    goal_id UUID REFERENCES public.progress_goals(id) ON DELETE CASCADE NOT NULL,
    value DECIMAL(8,2) NOT NULL,
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Body metrics
CREATE TABLE IF NOT EXISTS public.body_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    height DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    muscle_mass_percentage DECIMAL(4,2),
    bmi DECIMAL(4,2),
    measurements JSONB DEFAULT '{}',
    photos TEXT[] DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT CHECK (type IN ('workout_reminder', 'new_message', 'goal_achieved', 'nutrition_reminder', 'general')) DEFAULT 'general',
    data JSONB DEFAULT '{}',
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Users can read and update their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Coaches can view and manage their clients
CREATE POLICY "Coaches can view their clients" ON public.clients FOR SELECT USING (
    coach_id = auth.uid() OR user_id = auth.uid()
);
CREATE POLICY "Coaches can manage their clients" ON public.clients FOR ALL USING (
    coach_id = auth.uid()
);

-- Exercise library is readable by all authenticated users
CREATE POLICY "All users can view exercises" ON public.exercises FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Coaches can manage exercises" ON public.exercises FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coach')
);

-- Workout programs policies
CREATE POLICY "Workout programs are viewable by coach and client" ON public.workout_programs FOR SELECT USING (
    coach_id = auth.uid() OR client_id = auth.uid()
);
CREATE POLICY "Coaches can manage workout programs" ON public.workout_programs FOR ALL USING (
    coach_id = auth.uid()
);

-- Similar policies for related workout tables
CREATE POLICY "Workout weeks viewable by participants" ON public.workout_weeks FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.workout_programs WHERE id = program_id AND (coach_id = auth.uid() OR client_id = auth.uid()))
);
CREATE POLICY "Coaches can manage workout weeks" ON public.workout_weeks FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workout_programs WHERE id = program_id AND coach_id = auth.uid())
);

CREATE POLICY "Workout days viewable by participants" ON public.workout_days FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.workout_weeks w 
            JOIN public.workout_programs p ON w.program_id = p.id 
            WHERE w.id = week_id AND (p.coach_id = auth.uid() OR p.client_id = auth.uid()))
);
CREATE POLICY "Coaches can manage workout days" ON public.workout_days FOR ALL USING (
    EXISTS (SELECT 1 FROM public.workout_weeks w 
            JOIN public.workout_programs p ON w.program_id = p.id 
            WHERE w.id = week_id AND p.coach_id = auth.uid())
);

-- Workout sessions policies (clients can create and view their own sessions)
CREATE POLICY "Users can view their workout sessions" ON public.workout_sessions FOR SELECT USING (
    client_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.workout_programs WHERE id = program_id AND coach_id = auth.uid())
);
CREATE POLICY "Clients can manage their workout sessions" ON public.workout_sessions FOR ALL USING (
    client_id = auth.uid()
);

-- Chat messages policies
CREATE POLICY "Users can view their messages" ON public.chat_messages FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
);
CREATE POLICY "Users can send messages" ON public.chat_messages FOR INSERT WITH CHECK (
    sender_id = auth.uid()
);
CREATE POLICY "Users can update their messages" ON public.chat_messages FOR UPDATE USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
);

-- Progress goals policies
CREATE POLICY "Clients can view their goals" ON public.progress_goals FOR SELECT USING (
    client_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.clients WHERE user_id = client_id AND coach_id = auth.uid())
);
CREATE POLICY "Clients can manage their goals" ON public.progress_goals FOR ALL USING (
    client_id = auth.uid()
);

-- Food logs policies
CREATE POLICY "Clients can view their food logs" ON public.food_logs FOR SELECT USING (
    client_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.clients WHERE user_id = client_id AND coach_id = auth.uid())
);
CREATE POLICY "Clients can manage their food logs" ON public.food_logs FOR ALL USING (
    client_id = auth.uid()
);

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (
    user_id = auth.uid()
);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (
    user_id = auth.uid()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_clients_coach_id ON public.clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_programs_coach_id ON public.workout_programs(coach_id);
CREATE INDEX IF NOT EXISTS idx_workout_programs_client_id ON public.workout_programs(client_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_client_id ON public.workout_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON public.chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_food_logs_client_id ON public.food_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_food_logs_logged_at ON public.food_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_progress_goals_client_id ON public.progress_goals(client_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables that have updated_at column
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.exercises FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.workout_programs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.workout_weeks FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.workout_days FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.workout_exercises FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.workout_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.workout_session_exercises FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.nutrition_foods FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.nutrition_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.nutrition_meals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.progress_goals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();