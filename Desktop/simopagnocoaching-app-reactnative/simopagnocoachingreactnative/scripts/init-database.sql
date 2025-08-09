-- Script di inizializzazione database per SimoPagno Coaching App
-- Esegui questo script nel tuo database Supabase

-- Abilita le estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabella Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('coach', 'client')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Exercises
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  muscle_group TEXT,
  video_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Workouts
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES users(id),
  coach_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('assigned', 'in_progress', 'completed')) DEFAULT 'assigned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Workout Exercises
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight DECIMAL,
  rest_time INTEGER,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Foods
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  calories_per_100g INTEGER NOT NULL,
  protein_per_100g DECIMAL NOT NULL,
  carbs_per_100g DECIMAL NOT NULL,
  fat_per_100g DECIMAL NOT NULL,
  category TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Meal Plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES users(id),
  coach_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  total_calories INTEGER,
  total_protein DECIMAL,
  total_carbs DECIMAL,
  total_fat DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Meals
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Meal Foods
CREATE TABLE IF NOT EXISTS meal_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
  food_id UUID REFERENCES foods(id),
  quantity DECIMAL NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Progress
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES users(id),
  weight DECIMAL NOT NULL,
  front_photo_url TEXT,
  back_photo_url TEXT,
  notes TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  target_value DECIMAL NOT NULL,
  current_value DECIMAL DEFAULT 0,
  unit TEXT NOT NULL,
  target_date DATE,
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Chats
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES users(id),
  client_id UUID REFERENCES users(id),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'video')) DEFAULT 'text',
  media_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserimento dati di esempio per gli esercizi
INSERT INTO exercises (name, description, muscle_group) VALUES
('Push-up', 'Flessioni a terra', 'Petto'),
('Pull-up', 'Trazioni alla sbarra', 'Schiena'),
('Squat', 'Accosciate a corpo libero', 'Gambe'),
('Plank', 'Posizione di mantenimento', 'Core'),
('Burpee', 'Esercizio completo', 'Full Body'),
('Lunges', 'Affondi', 'Gambe'),
('Dumbbell Press', 'Lento con manubri', 'Spalle'),
('Lat Pulldown', 'Trazioni al pulley', 'Schiena'),
('Shoulder Press', 'Lento avanti', 'Spalle'),
('Deadlift', 'Stacco da terra', 'Schiena');

-- Inserimento dati di esempio per gli alimenti
INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category) VALUES
('Petto di Pollo', 165, 31, 0, 3.6, 'Proteine'),
('Salmone', 208, 25, 0, 12, 'Pesce'),
('Avena', 389, 16.9, 66.3, 6.9, 'Cereali'),
('Banana', 89, 1.1, 23, 0.3, 'Frutta'),
('Riso Integrale', 111, 2.6, 23, 0.9, 'Cereali'),
('Broccoli', 34, 2.8, 7, 0.4, 'Verdure'),
('Uova', 155, 13, 1.1, 11, 'Proteine'),
('Patate Dolci', 86, 1.6, 20, 0.1, 'Tuberi'),
('Spinaci', 23, 2.9, 3.6, 0.4, 'Verdure'),
('Proteine Whey', 113, 24, 3.4, 1.2, 'Integratori');

-- Abilita Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy per gli utenti (ogni utente può vedere solo se stesso)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policy per gli esercizi (tutti possono vedere)
CREATE POLICY "Anyone can view exercises" ON exercises
  FOR SELECT USING (true);

-- Policy per gli allenamenti
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = coach_id);

CREATE POLICY "Coaches can create workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Coaches can update workouts" ON workouts
  FOR UPDATE USING (auth.uid() = coach_id);

-- Policy per gli alimenti (tutti possono vedere)
CREATE POLICY "Anyone can view foods" ON foods
  FOR SELECT USING (true);

CREATE POLICY "Users can create custom foods" ON foods
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Policy per i piani alimentari
CREATE POLICY "Users can view own meal plans" ON meal_plans
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = coach_id);

CREATE POLICY "Coaches can create meal plans" ON meal_plans
  FOR INSERT WITH CHECK (auth.uid() = coach_id);

-- Policy per i progressi
CREATE POLICY "Users can view own progress" ON progress
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can create own progress" ON progress
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Policy per gli obiettivi
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Users can create own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = client_id);

-- Policy per le chat
CREATE POLICY "Users can view own chats" ON chats
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = coach_id);

CREATE POLICY "Users can create chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = coach_id);

-- Policy per i messaggi
CREATE POLICY "Users can view chat messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND (chats.client_id = auth.uid() OR chats.coach_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND (chats.client_id = auth.uid() OR chats.coach_id = auth.uid())
    )
  );

-- Funzione per aggiornare il timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
