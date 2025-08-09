-- 🗄️ Inizializzazione Utenti Specifici per SimoPagno Coaching
-- Esegui questo script nel SQL Editor di Supabase

-- 1. Assicurati che la tabella profiles abbia la colonna is_active
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Rimuovi utenti esistenti con le stesse email (se esistono)
DELETE FROM profiles WHERE email IN ('loerstudio0@gmail.com', 'itsilorenz07@gmail.com');

-- 3. Inserisci i due utenti specifici
INSERT INTO profiles (id, email, name, role, is_active, created_at, updated_at)
VALUES 
  (
    gen_random_uuid(),
    'loerstudio0@gmail.com',
    'Simo Pagno',
    'coach',
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'itsilorenz07@gmail.com',
    'Lorenzo',
    'client',
    true,
    NOW(),
    NOW()
  );

-- 4. Verifica che gli utenti siano stati creati
SELECT 
  id,
  email, 
  name, 
  role, 
  is_active, 
  created_at,
  updated_at
FROM profiles 
WHERE email IN ('loerstudio0@gmail.com', 'itsilorenz07@gmail.com')
ORDER BY created_at;

-- 5. Aggiorna le policy RLS per la gestione utenti
-- Rimuovi policy esistenti
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authorized coaches can manage all users" ON profiles;

-- Nuove policy che considerano is_active e autorizzazioni coach
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id AND is_active = true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id AND is_active = true);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy per coach autorizzati per gestire tutti gli utenti
CREATE POLICY "Authorized coaches can manage all users" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'coach' 
      AND email = 'loerstudio0@gmail.com'
      AND is_active = true
    )
  );

-- 6. Verifica le policy create
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 7. Verifica la struttura finale della tabella
\d profiles;
