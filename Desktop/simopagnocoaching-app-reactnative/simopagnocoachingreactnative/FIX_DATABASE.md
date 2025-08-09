# 🔧 Correzione Database Supabase

## 🚨 Problemi Risolti

### 1. Errori RLS (Row Level Security)
- **Problema**: Policy troppo restrittive per la creazione profili
- **Soluzione**: Aggiornate le policy per permettere inserimento profili

### 2. Dati Demo Rimossi
- **Problema**: Utenti demo creati automaticamente
- **Soluzione**: Rimossi tutti i dati demo - solo dati reali

### 3. Sessioni Mancanti
- **Problema**: Errori di sessione autenticazione
- **Soluzione**: Migliorata gestione sessioni e profili automatici

## 🔧 Step per Correggere il Database

### Step 1: Aggiorna le Policy RLS

1. **Vai su Supabase Dashboard**
   - Menu laterale → **SQL Editor**
   - Clicca **New query**

2. **Copia e incolla questo script**:

```sql
-- 🗑️ Rimuovi policy esistenti (se esistono)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their chats" ON chats;
DROP POLICY IF EXISTS "Coaches can create chats" ON chats;
DROP POLICY IF EXISTS "Users can view messages from their chats" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their chats" ON messages;
DROP POLICY IF EXISTS "Users can update messages in their chats" ON messages;
DROP POLICY IF EXISTS "Everyone can view exercises" ON exercises;
DROP POLICY IF EXISTS "Coaches can create exercises" ON exercises;
DROP POLICY IF EXISTS "Users can view their workouts" ON workouts;
DROP POLICY IF EXISTS "Coaches can create workouts" ON workouts;
DROP POLICY IF EXISTS "Users can view workout exercises" ON workout_exercises;
DROP POLICY IF EXISTS "Coaches can create workout exercises" ON workout_exercises;
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

-- 📋 Policy per workouts
CREATE POLICY "Users can view their workouts" ON workouts
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = coach_id);

CREATE POLICY "Users can create workouts" ON workouts
  FOR INSERT WITH CHECK (
    auth.uid() = client_id OR auth.uid() = coach_id
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
```

3. **Clicca "Run"** per eseguire lo script

### Step 2: Rimuovi Dati Demo (Opzionale)

Se vuoi rimuovere i dati demo esistenti:

```sql
-- Rimuovi utenti demo (se esistono)
DELETE FROM profiles WHERE email = 'itsilorenz07@gmail.com';
DELETE FROM auth.users WHERE email = 'itsilorenz07@gmail.com';
```

### Step 3: Testa l'App

1. **Riavvia l'app**:
```bash
npm start
```

2. **Testa la registrazione**:
   - Inserisci una nuova email
   - Clicca "Invia OTP"
   - Controlla la casella email
   - Inserisci il codice OTP

3. **Verifica il database**:
   - Vai su Supabase Dashboard → Table Editor
   - Controlla la tabella `profiles`
   - Dovresti vedere il nuovo utente creato

## ✅ Risultato Finale

Dopo queste correzioni:
- ✅ **Nessun errore RLS**
- ✅ **Nessun dato demo**
- ✅ **Solo dati reali**
- ✅ **Registrazione funzionante**
- ✅ **Login OTP funzionante**
- ✅ **Chat funzionante**

## 🎯 Modalità Dati Reali

L'app ora:
- ❌ **NON crea** utenti demo automaticamente
- ❌ **NON inserisce** dati di test
- ✅ **SOLO** dati reali degli utenti
- ✅ **SOLO** conversazioni reali
- ✅ **SOLO** messaggi reali

**L'app è ora completamente in modalità dati reali!** 🚀
