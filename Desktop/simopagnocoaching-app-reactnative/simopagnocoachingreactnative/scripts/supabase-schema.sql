-- 🗄️ Schema Database per SimoPagno Coaching
-- Esegui questi script nel SQL Editor di Supabase

-- 1. Tabella profiles (utenti)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('coach', 'client')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabella chats (conversazioni)
CREATE TABLE IF NOT EXISTS chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES profiles(id) NOT NULL,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabella messages (messaggi)
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'video')) DEFAULT 'text',
  media_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabella exercises (esercizi)
CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  muscle_group TEXT NOT NULL,
  video_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabella workouts (allenamenti)
CREATE TABLE IF NOT EXISTS workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  coach_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('assigned', 'in_progress', 'completed')) DEFAULT 'assigned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabella workout_exercises (esercizi negli allenamenti)
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight DECIMAL,
  rest_time INTEGER,
  order_index INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE
);

-- 🔐 Abilita Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

-- 📋 Policy per profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 📋 Policy per chats
CREATE POLICY "Users can view their chats" ON chats
  FOR SELECT USING (auth.uid() = coach_id OR auth.uid() = client_id);

CREATE POLICY "Coaches can create chats" ON chats
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- 📋 Policy per messages
CREATE POLICY "Users can view messages from their chats" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE id = chat_id AND (coach_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their chats" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chats 
      WHERE id = chat_id AND (coach_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "Users can update messages in their chats" ON messages
  FOR UPDATE USING (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chats 
      WHERE id = chat_id AND (coach_id = auth.uid() OR client_id = auth.uid())
    )
  );

-- 📋 Policy per exercises (pubblici)
CREATE POLICY "Everyone can view exercises" ON exercises
  FOR SELECT USING (true);

CREATE POLICY "Coaches can create exercises" ON exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

-- 📋 Policy per workouts
CREATE POLICY "Users can view their workouts" ON workouts
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = coach_id);

CREATE POLICY "Coaches can create workouts" ON workouts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'coach'
    )
  );

CREATE POLICY "Users can update their workouts" ON workouts
  FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = coach_id);

-- 📋 Policy per workout_exercises
CREATE POLICY "Users can view workout exercises" ON workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE id = workout_id AND (client_id = auth.uid() OR coach_id = auth.uid())
    )
  );

CREATE POLICY "Coaches can create workout exercises" ON workout_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts w
      JOIN profiles p ON p.id = auth.uid()
      WHERE w.id = workout_id AND p.role = 'coach'
    )
  );

CREATE POLICY "Users can update workout exercises" ON workout_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE id = workout_id AND (client_id = auth.uid() OR coach_id = auth.uid())
    )
  );

-- 🎯 Inserisci dati di esempio
INSERT INTO exercises (name, description, muscle_group) VALUES
('Push-up', 'Flessioni a terra', 'Petto'),
('Squat', 'Accovacciamenti', 'Gambe'),
('Plank', 'Posizione di equilibrio', 'Core'),
('Pull-up', 'Trazioni alla sbarra', 'Schiena'),
('Burpee', 'Esercizio completo', 'Full body')
ON CONFLICT DO NOTHING;
