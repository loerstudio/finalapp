# 🚀 Configurazione Supabase per SimoPagno Coaching

## 📋 Prerequisiti
- Account Supabase (gratuito): https://supabase.com
- Progetto Supabase creato

## 🔧 Configurazione

### 1. Crea un Progetto Supabase
1. Vai su [supabase.com](https://supabase.com)
2. Clicca "New Project"
3. Scegli un nome: `simopagnocoaching`
4. Scegli una password forte per il database
5. Seleziona una regione (es. West Europe)
6. Clicca "Create new project"

### 2. Ottieni le Credenziali
1. Nel dashboard del progetto, vai su **Settings** → **API**
2. Copia:
   - **Project URL** (es. `https://your-project.supabase.co`)
   - **anon public** key

### 3. Aggiorna la Configurazione
Modifica `config.js`:

```javascript
export const config = {
  supabase: {
    url: 'https://your-project.supabase.co', // Il tuo Project URL
    anonKey: 'your-anon-key-here', // La tua anon public key
  },
  // ... resto della configurazione
};
```

## 🗄️ Schema Database

### Tabella `profiles`
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('coach', 'client')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabella `chats`
```sql
CREATE TABLE chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES profiles(id) NOT NULL,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabella `messages`
```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'video')) DEFAULT 'text',
  media_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabella `workouts`
```sql
CREATE TABLE workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) NOT NULL,
  coach_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('assigned', 'in_progress', 'completed')) DEFAULT 'assigned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabella `workout_exercises`
```sql
CREATE TABLE workout_exercises (
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
```

### Tabella `exercises`
```sql
CREATE TABLE exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  muscle_group TEXT NOT NULL,
  video_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Row Level Security (RLS)

### Abilita RLS su tutte le tabelle
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
```

### Policy per `profiles`
```sql
-- Utenti possono vedere solo il proprio profilo
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Utenti possono aggiornare solo il proprio profilo
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Policy per `chats`
```sql
-- Utenti possono vedere solo le chat in cui partecipano
CREATE POLICY "Users can view their chats" ON chats
  FOR SELECT USING (auth.uid() = coach_id OR auth.uid() = client_id);

-- Solo coach possono creare chat
CREATE POLICY "Coaches can create chats" ON chats
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'coach'
    )
  );
```

### Policy per `messages`
```sql
-- Utenti possono vedere messaggi delle loro chat
CREATE POLICY "Users can view messages from their chats" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE id = chat_id AND (coach_id = auth.uid() OR client_id = auth.uid())
    )
  );

-- Utenti possono inviare messaggi nelle loro chat
CREATE POLICY "Users can send messages in their chats" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chats 
      WHERE id = chat_id AND (coach_id = auth.uid() OR client_id = auth.uid())
    )
  );
```

## 📧 Configurazione Email

### 1. Abilita Email Auth
1. Vai su **Authentication** → **Settings**
2. Abilita "Enable email confirmations"
3. Configura il template email OTP

### 2. Template Email OTP
```html
<h2>🔐 Codice OTP - SimoPagno Coaching</h2>
<p>Ciao!</p>
<p>Il tuo codice OTP è: <strong>{{ .Token }}</strong></p>
<p>Valido per 10 minuti.</p>
<p>SimoPagno Coaching</p>
```

## 🚀 Test

### 1. Test Autenticazione
```bash
npm start
```

### 2. Test Login
- Email: `itsilorenz07@gmail.com`
- Password: `LorenzoCoach123`

### 3. Test OTP
- Inserisci email
- Controlla la casella email per l'OTP
- Inserisci l'OTP ricevuto

## 🔧 Troubleshooting

### Errore "Invalid API key"
- Verifica che l'anon key sia corretta
- Controlla che il project URL sia giusto

### Errore "Table does not exist"
- Esegui gli script SQL per creare le tabelle
- Verifica che RLS sia abilitato

### OTP non ricevuto
- Controlla la cartella spam
- Verifica la configurazione email in Supabase
- Controlla i log in Supabase Dashboard

## 📱 Funzionalità Implementate

- ✅ **Autenticazione Supabase** (email/password + OTP)
- ✅ **Gestione sessioni** persistente
- ✅ **Chat in tempo reale** con Supabase
- ✅ **Database relazionale** con RLS
- ✅ **Sincronizzazione automatica** dei dati

## 🔄 Prossimi Passi

1. **Implementare real-time** per le chat
2. **Aggiungere notifiche push**
3. **Implementare upload file** per media
4. **Aggiungere analytics** e monitoring
