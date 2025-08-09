-- 🏋️ Tabella per i programmi di workout
-- Esegui questo comando nel SQL Editor di Supabase

CREATE TABLE workout_programs (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  exercises TEXT, -- JSON string contenente l'array degli esercizi
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice per performance sulle query per user
CREATE INDEX idx_workout_programs_user_id ON workout_programs(user_id);

-- RLS (Row Level Security) per assicurarsi che ogni utente veda solo i suoi programmi
ALTER TABLE workout_programs ENABLE ROW LEVEL SECURITY;

-- Policy per permettere agli utenti di vedere solo i propri programmi
CREATE POLICY "Users can view their own workout programs" 
ON workout_programs 
FOR SELECT 
USING (user_id = current_user_email());

-- Policy per permettere agli utenti di inserire i propri programmi
CREATE POLICY "Users can insert their own workout programs" 
ON workout_programs 
FOR INSERT 
WITH CHECK (user_id = current_user_email());

-- Policy per permettere agli utenti di aggiornare i propri programmi
CREATE POLICY "Users can update their own workout programs" 
ON workout_programs 
FOR UPDATE 
USING (user_id = current_user_email());

-- Policy per permettere agli utenti di eliminare i propri programmi
CREATE POLICY "Users can delete their own workout programs" 
ON workout_programs 
FOR DELETE 
USING (user_id = current_user_email());

-- Funzione helper per ottenere l'email dell'utente corrente
-- (se non esiste già)
CREATE OR REPLACE FUNCTION current_user_email()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email',
    'demo@user.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per aggiornare automaticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workout_programs_updated_at 
    BEFORE UPDATE ON workout_programs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 📊 Tabella per lo storico degli allenamenti completati
CREATE TABLE workout_history (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  program_id BIGINT, -- Riferimento al programma (può essere null per allenamenti individuali)
  program_name TEXT NOT NULL,
  program_data TEXT, -- JSON del programma al momento dell'allenamento
  exercises TEXT NOT NULL, -- JSON degli esercizi eseguiti
  duration_minutes INTEGER NOT NULL,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice per performance sulle query per user e data
CREATE INDEX idx_workout_history_user_id ON workout_history(user_id);
CREATE INDEX idx_workout_history_completed_at ON workout_history(completed_at DESC);

-- RLS per lo storico allenamenti
ALTER TABLE workout_history ENABLE ROW LEVEL SECURITY;

-- Policy per permettere agli utenti di vedere solo il proprio storico
CREATE POLICY "Users can view their own workout history" 
ON workout_history 
FOR SELECT 
USING (user_id = current_user_email());

-- Policy per permettere agli utenti di inserire nel proprio storico
CREATE POLICY "Users can insert their own workout history" 
ON workout_history 
FOR INSERT 
WITH CHECK (user_id = current_user_email());

-- Policy per permettere agli utenti di aggiornare il proprio storico
CREATE POLICY "Users can update their own workout history" 
ON workout_history 
FOR UPDATE 
USING (user_id = current_user_email());

-- Policy per permettere agli utenti di eliminare dal proprio storico
CREATE POLICY "Users can delete their own workout history" 
ON workout_history 
FOR DELETE 
USING (user_id = current_user_email()); 