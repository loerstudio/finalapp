# 🚀 GUIDA COMPLETA: Creazione Primi Utenti

## 📋 **PREREQUISITI**
- ✅ Progetto Supabase configurato
- ✅ Database schema creato
- ✅ Credenziali Supabase (URL + Service Role Key)

---

## 🗄️ **STEP 1: PREPARAZIONE DATABASE**

### **1.1 Vai su Supabase Dashboard**
1. Apri [supabase.com](https://supabase.com)
2. Accedi al tuo progetto `simopagnocoaching`
3. Menu laterale → **SQL Editor**
4. Clicca **New query**

### **1.2 Esegui lo Schema Database CORRETTO**
Copia e incolla questo script completo (VERSIONE CORRETTA):

```sql
-- 🗄️ Schema Database per SimoPagno Coaching (VERSIONE CORRETTA)
-- Esegui questo script nel SQL Editor di Supabase

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

-- 🗑️ Rimuovi policy esistenti (se esistono)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their chats" ON chats;
DROP POLICY IF EXISTS "Users can create chats" ON chats;
DROP POLICY IF EXISTS "Users can view messages from their chats" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their chats" ON messages;
DROP POLICY IF EXISTS "Everyone can view exercises" ON exercises;
DROP POLICY IF EXISTS "Authenticated users can create exercises" ON exercises;
DROP POLICY IF EXISTS "Users can view their workouts" ON workouts;
DROP POLICY IF EXISTS "Users can create workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update their workouts" ON workouts;
DROP POLICY IF EXISTS "Users can view workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can create workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Users can update workout exercises" ON workout_exercises;

-- 📋 Policy CORRETTE per profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 📋 Policy per chats
CREATE POLICY "Users can view their chats" ON chats
  FOR SELECT USING (auth.uid() = coach_id OR auth.uid() = client_id);

CREATE POLICY "Users can create chats" ON chats
  FOR INSERT WITH CHECK (
    auth.uid() = coach_id OR auth.uid() = client_id
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

CREATE POLICY "Authenticated users can create exercises" ON exercises
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 📋 Policy per workouts (CORRETTE)
CREATE POLICY "Users can view their workouts" ON workouts
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = coach_id);

CREATE POLICY "Users can create workouts" ON workouts
  FOR INSERT WITH CHECK (
    auth.uid() = client_id OR auth.uid() = coach_id
  );

CREATE POLICY "Users can update their workouts" ON workouts
  FOR UPDATE USING (
    auth.uid() = client_id OR auth.uid() = coach_id
  );

-- 📋 Policy per workout_exercises (CORRETTE)
CREATE POLICY "Users can view workout exercises" ON workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE id = workout_id AND (client_id = auth.uid() OR coach_id = auth.uid())
    )
  );

CREATE POLICY "Users can create workout exercises" ON workout_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE id = workout_id AND (client_id = auth.uid() OR coach_id = auth.uid())
    )
  );

CREATE POLICY "Users can update workout exercises" ON workout_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE id = workout_id AND (client_id = auth.uid() OR coach_id = auth.uid())
    )
  );

-- 🎯 Inserimento dati di esempio per gli esercizi
INSERT INTO exercises (name, description, muscle_group) VALUES
('Push-up', 'Flessioni a terra per petto e tricipiti', 'Petto'),
('Pull-up', 'Trazioni alla sbarra per schiena e bicipiti', 'Schiena'),
('Squat', 'Accosciate a corpo libero per gambe', 'Gambe'),
('Plank', 'Posizione di mantenimento per core', 'Core'),
('Burpee', 'Esercizio completo full body', 'Full Body'),
('Lunges', 'Affondi per gambe', 'Gambe'),
('Dumbbell Press', 'Lento con manubri per spalle', 'Spalle'),
('Lat Pulldown', 'Trazioni al pulley per schiena', 'Schiena'),
('Shoulder Press', 'Lento avanti per spalle', 'Spalle'),
('Deadlift', 'Stacco da terra per schiena', 'Schiena')
ON CONFLICT (name) DO NOTHING;

-- ✅ Messaggio di conferma
SELECT '🎉 Database schema creato con successo!' as status;
```

### **1.3 Verifica le Tabelle**
1. Menu laterale → **Table Editor**
2. Dovresti vedere: `profiles`, `chats`, `messages`, `exercises`, `workouts`, `workout_exercises`
3. Dovresti vedere il messaggio: `🎉 Database schema creato con successo!`

---

## 🔑 **STEP 2: OTTIENI SERVICE ROLE KEY**

### **2.1 Vai su Settings → API**
1. Nel dashboard Supabase, menu laterale → **Settings**
2. Clicca **API**
3. Copia la **service_role** key (NON la anon key!)

### **2.2 Aggiorna lo Script**
1. Apri `scripts/config.js`
2. Sostituisci `YOUR_SERVICE_ROLE_KEY_HERE` con la tua service role key
3. Salva il file

---

## 👥 **STEP 3: CREA GLI UTENTI**

### **3.1 Installa Dipendenze**
```bash
cd simopagnocoachingreactnative
npm install @supabase/supabase-js
```

### **3.2 Esegui lo Script**
```bash
node scripts/create-first-users.js
```

### **3.3 Risultato Atteso**
Dovresti vedere:
```
🚀 Creazione primi utenti SimoPagno Coaching...

👨‍💼 Creazione utente COACH...
✅ Utente coach creato in Auth: [UUID]
✅ Profilo coach creato: [oggetto profilo]
👨‍💼 COACH creato con successo!

👤 Creazione utente CLIENTE...
✅ Utente cliente creato in Auth: [UUID]
✅ Profilo cliente creato: [oggetto profilo]
👤 CLIENTE creato con successo!

💬 Creazione chat tra coach e cliente...
✅ Chat creata: [UUID]

📝 Creazione messaggio di benvenuto...
✅ Messaggio di benvenuto creato

🎉 RIEPILOGO UTENTI CREATI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👨‍💼 COACH:
   Email: coach@simopagnocoaching.com
   Password: Coach2024!
   Nome: Simo Pagno
   ID: [UUID]

👤 CLIENTE:
   Email: cliente@simopagnocoaching.com
   Password: Cliente2024!
   Nome: Mario Rossi
   ID: [UUID]

💬 CHAT:
   ID: [UUID]
   Coach: Simo Pagno
   Cliente: Mario Rossi

📝 MESSAGGIO:
   Contenuto: Ciao! Benvenuto in SimoPagno Coaching! Sono qui per aiutarti a raggiungere i tuoi obiettivi fitness. 🏋️‍♂️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Tutti gli utenti sono stati creati con successo!
🚀 Ora puoi testare l'autenticazione nell'app!
```

---

## 🧪 **STEP 4: TEST AUTENTICAZIONE**

### **4.1 Test Coach**
1. Avvia l'app: `npm start`
2. Vai alla schermata di login
3. Inserisci:
   - **Email**: `coach@simopagnocoaching.com`
   - **Password**: `Coach2024!`
4. Clicca Login
5. Dovresti accedere come coach

### **4.2 Test Cliente**
1. Fai logout
2. Inserisci:
   - **Email**: `cliente@simopagnocoaching.com`
   - **Password**: `Cliente2024!`
3. Clicca Login
4. Dovresti accedere come cliente

---

## 🔍 **STEP 5: VERIFICA DATABASE**

### **5.1 Controlla Tabelle**
1. Supabase Dashboard → **Table Editor**
2. **profiles**: dovresti vedere 2 utenti
3. **chats**: dovresti vedere 1 chat
4. **messages**: dovresti vedere 1 messaggio
5. **exercises**: dovresti vedere 10 esercizi di esempio

### **5.2 Controlla Auth**
1. Supabase Dashboard → **Authentication** → **Users**
2. Dovresti vedere 2 utenti confermati

---

## 🚨 **RISOLUZIONE PROBLEMI**

### **Problema: "Service role key non valida"**
- ✅ Verifica di aver copiato la service_role key, non anon key
- ✅ La service role key inizia con `eyJ...`

### **Problema: "Tabelle non esistenti"**
- ✅ Esegui prima lo schema database
- ✅ Verifica che tutte le tabelle siano create

### **Problema: "Policy RLS non valide"**
- ✅ Esegui tutto lo script SQL completo
- ✅ Verifica che le policy siano create correttamente

### **Problema: "Utente non può accedere"**
- ✅ Verifica che l'email sia confermata
- ✅ Controlla che il profilo sia stato creato nella tabella profiles

---

## 🎯 **PROSSIMI PASSI**

Dopo aver creato gli utenti:

1. **Testa l'autenticazione** nell'app
2. **Verifica le funzionalità** per coach e cliente
3. **Testa la chat** tra coach e cliente
4. **Crea workout e esercizi** di test
5. **Personalizza i profili** utente

---

## 💡 **RICORDA**

- **Service Role Key**: Usa sempre questa per creare utenti (bypassa RLS)
- **Anon Key**: Usa questa nell'app per l'autenticazione normale
- **RLS**: Le policy proteggono i dati degli utenti
- **Profili**: Ogni utente deve avere un profilo nella tabella profiles

---

## 🎉 **COMPLIMENTI!**

Hai creato con successo:
- ✅ **1 Coach**: Simo Pagno
- ✅ **1 Cliente**: Mario Rossi  
- ✅ **1 Chat** tra coach e cliente
- ✅ **1 Messaggio** di benvenuto
- ✅ **10 Esercizi** di esempio
- ✅ **Database** completamente configurato

Ora l'app è pronta per essere testata con utenti reali! 🚀
