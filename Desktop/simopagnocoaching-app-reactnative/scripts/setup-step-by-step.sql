-- =====================================================
-- SETUP STEP BY STEP - UN COMANDO ALLA VOLTA
-- =====================================================

-- PASSO 1: Aggiungi colonna is_active
-- Esegui SOLO questo blocco
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- PASSO 2: Verifica che la colonna sia stata aggiunta
-- Esegui SOLO questo blocco
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'is_active';

-- PASSO 3: Pulisci utenti esistenti
-- Esegui SOLO questo blocco
DELETE FROM profiles WHERE email IN ('loerstudio0@gmail.com', 'itsilorenz07@gmail.com');

-- PASSO 4: Verifica che gli utenti siano stati eliminati
-- Esegui SOLO questo blocco
SELECT COUNT(*) as utenti_rimanenti FROM profiles WHERE email IN ('loerstudio0@gmail.com', 'itsilorenz07@gmail.com');

-- PASSO 5: Crea utente coach
-- Esegui SOLO questo blocco
INSERT INTO profiles (id, email, name, role, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'loerstudio0@gmail.com',
    'Coach SimoPagno',
    'coach',
    true,
    now(),
    now()
);

-- PASSO 6: Verifica che il coach sia stato creato
-- Esegui SOLO questo blocco
SELECT email, name, role, is_active FROM profiles WHERE email = 'loerstudio0@gmail.com';

-- PASSO 7: Crea utente cliente
-- Esegui SOLO questo blocco
INSERT INTO profiles (id, email, name, role, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'itsilorenz07@gmail.com',
    'Cliente Test',
    'client',
    true,
    now(),
    now()
);

-- PASSO 8: Verifica che entrambi gli utenti siano stati creati
-- Esegui SOLO questo blocco
SELECT email, name, role, is_active FROM profiles WHERE email IN ('loerstudio0@gmail.com', 'itsilorenz07@gmail.com');

-- PASSO 9: Abilita RLS
-- Esegui SOLO questo blocco
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- PASSO 10: Verifica che RLS sia abilitato
-- Esegui SOLO questo blocco
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'profiles';

-- PASSO 11: Crea policy per coach
-- Esegui SOLO questo blocco
CREATE POLICY "Coach can do everything" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND email = 'loerstudio0@gmail.com' 
            AND role = 'coach'
        )
    );

-- PASSO 12: Crea policy per utenti normali
-- Esegui SOLO questo blocco
CREATE POLICY "Users can manage own profile" ON profiles
    FOR ALL USING (auth.uid() = id);

-- PASSO 13: Verifica finale
-- Esegui SOLO questo blocco
SELECT 'VERIFICA FINALE:' as status;
SELECT email, name, role, is_active FROM profiles WHERE email IN ('loerstudio0@gmail.com', 'itsilorenz07@gmail.com');
