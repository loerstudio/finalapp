-- =====================================================
-- SETUP ULTRA SEMPLICE - SOLO COSE ESSENZIALI
-- =====================================================

-- 1. Aggiungi colonna is_active se non esiste
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Pulisci utenti esistenti (se esistono)
DELETE FROM profiles WHERE email IN ('loerstudio0@gmail.com', 'itsilorenz07@gmail.com');

-- 3. Crea utente coach
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

-- 4. Crea utente cliente
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

-- 5. Abilita RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Crea policy semplice per coach
CREATE POLICY "Coach can do everything" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND email = 'loerstudio0@gmail.com' 
            AND role = 'coach'
        )
    );

-- 7. Crea policy per utenti normali
CREATE POLICY "Users can manage own profile" ON profiles
    FOR ALL USING (auth.uid() = id);

-- 8. Verifica finale
SELECT 'UTENTI CREATI:' as status;
SELECT email, name, role, is_active FROM profiles WHERE email IN ('loerstudio0@gmail.com', 'itsilorenz07@gmail.com');
