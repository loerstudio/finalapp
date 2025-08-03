# Supabase Setup Guide

## Errore "Invalid UUID appId"

Se stai ricevendo l'errore `HTTP response error 500: {"error":"[GraphQL] Invalid UUID appId"}`, significa che la configurazione di Supabase non è corretta.

## Soluzione

### 1. Crea un nuovo progetto Supabase

1. Vai su [https://supabase.com](https://supabase.com)
2. Accedi o crea un account
3. Clicca su "New Project"
4. Scegli un nome per il progetto (es: "spc-fitness-app")
5. Imposta una password sicura per il database
6. Seleziona una regione vicina a te
7. Clicca "Create new project"

### 2. Ottieni le credenziali

1. Una volta creato il progetto, vai su **Settings** > **API**
2. Copia il **Project URL** (formato: `https://abcdefgh.supabase.co`)
3. Copia la **anon/public key** (lunga stringa JWT)

### 3. Aggiorna la configurazione

Sostituisci le credenziali nel file `src/services/supabase.ts`:

```typescript
const supabaseUrl = 'IL_TUO_PROJECT_URL_QUI';
const supabaseAnonKey = 'LA_TUA_ANON_KEY_QUI';
```

### 4. Crea le tabelle del database

Vai su **SQL Editor** in Supabase e esegui questo script:

```sql
-- Enable RLS
ALTER DATABASE postgres SET row_security = on;

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('client', 'coach')) DEFAULT 'client',
  phone TEXT,
  date_of_birth DATE,
  subscription_plan TEXT,
  subscription_status TEXT DEFAULT 'active',
  coach_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image')),
  image_url TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition foods table
CREATE TABLE nutrition_foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  calories_per_100g DECIMAL NOT NULL,
  protein_per_100g DECIMAL NOT NULL,
  carbs_per_100g DECIMAL NOT NULL,
  fats_per_100g DECIMAL NOT NULL,
  fiber_per_100g DECIMAL DEFAULT 0,
  sugar_per_100g DECIMAL DEFAULT 0,
  sodium_per_100g DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food logs table
CREATE TABLE food_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES nutrition_foods(id) ON DELETE CASCADE NOT NULL,
  quantity_grams DECIMAL NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress goals table
CREATE TABLE progress_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL,
  start_value DECIMAL NOT NULL,
  current_value DECIMAL NOT NULL,
  target_value DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  target_date DATE NOT NULL,
  is_achieved BOOLEAN DEFAULT false,
  before_photo TEXT,
  after_photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Body metrics table
CREATE TABLE body_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight DECIMAL,
  height DECIMAL,
  bmi DECIMAL,
  body_fat_percentage DECIMAL,
  muscle_mass DECIMAL,
  photos TEXT[],
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles
CREATE POLICY "Users can view and edit their own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Coaches can view their clients" ON profiles
  FOR SELECT USING (coach_id = auth.uid() OR auth.uid() = id);

-- Chat messages
CREATE POLICY "Users can view their own messages" ON chat_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Food logs
CREATE POLICY "Users can manage their own food logs" ON food_logs
  FOR ALL USING (auth.uid() = client_id);

-- Progress goals
CREATE POLICY "Users can manage their own goals" ON progress_goals
  FOR ALL USING (auth.uid() = client_id);

-- Body metrics
CREATE POLICY "Users can manage their own metrics" ON body_metrics
  FOR ALL USING (auth.uid() = client_id);

-- Nutrition foods (public read, admin write)
CREATE POLICY "Anyone can view foods" ON nutrition_foods
  FOR SELECT USING (true);
```

### 5. Crea i bucket di storage

Vai su **Storage** in Supabase e crea questi bucket:

1. `chat-images` (per le foto della chat)
2. `progress-photos` (per le foto dei progressi)
3. `food-images` (per le foto del cibo scansionato)

### 6. Configurazione finale

Assicurati che:
- Il progetto Supabase sia attivo (non in pausa)
- Le tabelle siano create correttamente
- Le policy RLS siano attive
- I bucket di storage siano pubblici per la lettura

## Test della connessione

Una volta configurato tutto, usa la schermata Debug nell'app per testare la connessione.

## Credenziali di esempio attuali

Le credenziali nel codice attuale sono:
- URL: `https://xlyoszduijhqakfwzdys.supabase.co`
- Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**IMPORTANTE**: Sostituiscile con le tue credenziali reali dal tuo progetto Supabase!