-- =====================================================
-- SCRIPT COMPLETO PER INIZIALIZZAZIONE SISTEMA
-- GESTIONE UTENTI COACH-CLIENT
-- =====================================================
-- 
-- Questo script:
-- 1. Gestisce automaticamente tutte le relazioni esistenti
-- 2. Pulisce il database in modo sicuro
-- 3. Crea la struttura necessaria
-- 4. Inserisce gli utenti predefiniti
-- 5. Configura tutte le policy RLS
-- 6. Verifica la configurazione finale
--
-- ESEGUI QUESTO SCRIPT COMPLETO IN UNA VOLTA SOLA
-- =====================================================

-- FASE 1: VERIFICA E PREPARAZIONE
-- =====================================================

-- Verifica se la colonna is_active esiste già
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_active'
    ) THEN
        -- Aggiungi la colonna is_active se non esiste
        ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Colonna is_active aggiunta alla tabella profiles';
    ELSE
        RAISE NOTICE 'Colonna is_active già presente nella tabella profiles';
    END IF;
END $$;

-- FASE 2: PULIZIA SICURA DELLE RELAZIONI ESISTENTI
-- =====================================================

-- 2.1 Pulisci la tabella chats (se esiste)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chats') THEN
        -- Elimina tutti i chat associati agli utenti che stiamo per ricreare
        DELETE FROM chats WHERE coach_id IN (
            SELECT id FROM profiles WHERE email IN ('loerstudio0@gmail.com', 'itsilorenz07@gmail.com')
        );
        RAISE NOTICE 'Relazioni nella tabella chats pulite';
    END IF;
END $$;

-- 2.2 Pulisci la tabella workouts (se esiste)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workouts') THEN
        DELETE FROM workouts WHERE user_id IN (
            SELECT id FROM profiles WHERE email IN ('loerstudio0@gmail.com', 'itsilorenz07@gmail.com')
        );
        RAISE NOTICE 'Relazioni nella tabella workouts pulite';
    END IF;
END $$;

-- 2.3 Pulisci la tabella nutrition_logs (se esiste)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nutrition_logs') THEN
        DELETE FROM nutrition_logs WHERE user_id IN (
            SELECT id FROM profiles WHERE email IN ('loerstudio0@gmail.com', 'itsilorenz07@gmail.com')
        );
        RAISE NOTICE 'Relazioni nella tabella nutrition_logs pulite';
    END IF;
END $$;

-- 2.4 Pulisci la tabella progress_logs (se esiste)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'progress_logs') THEN
        DELETE FROM progress_logs WHERE user_id IN (
            SELECT id FROM profiles WHERE email IN ('loerstudio0@gmail.com', 'itsilorenz07@gmail.com')
        );
        RAISE NOTICE 'Relazioni nella tabella progress_logs pulite';
    END IF;
END $$;

-- 2.5 Pulisci la tabella user_sessions (se esiste)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions') THEN
        DELETE FROM user_sessions WHERE user_id IN (
            SELECT id FROM profiles WHERE email IN ('loerstudio0@gmail.com', 'itsilorenz07@gmail.com')
        );
        RAISE NOTICE 'Relazioni nella tabella user_sessions pulite';
    END IF;
END $$;

-- FASE 3: ELIMINAZIONE UTENTI ESISTENTI
-- =====================================================

-- Elimina gli utenti esistenti (ora sicuro dopo la pulizia delle relazioni)
DELETE FROM profiles WHERE email IN ('loerstudio0@gmail.com', 'itsilorenz07@gmail.com');

-- FASE 4: CREAZIONE UTENTI NEL SISTEMA AUTH
-- =====================================================

-- 4.1 Crea l'utente coach nel sistema auth
DO $$
DECLARE
    coach_user_id UUID;
BEGIN
    -- Crea l'utente nel sistema auth
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        (SELECT id FROM auth.instances LIMIT 1),
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'loerstudio0@gmail.com',
        crypt('CoachPassword123!', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Coach SimoPagno","role":"coach"}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    ) RETURNING id INTO coach_user_id;
    
    -- Inserisci il profilo coach
    INSERT INTO profiles (id, email, name, role, is_active, created_at, updated_at)
    VALUES (coach_user_id, 'loerstudio0@gmail.com', 'Coach SimoPagno', 'coach', true, now(), now());
    
    RAISE NOTICE 'Coach creato con ID: %', coach_user_id;
END $$;

-- 4.2 Crea l'utente cliente nel sistema auth
DO $$
DECLARE
    client_user_id UUID;
BEGIN
    -- Crea l'utente nel sistema auth
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        (SELECT id FROM auth.instances LIMIT 1),
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'itsilorenz07@gmail.com',
        crypt('ClientPassword123!', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"name":"Cliente Test","role":"client"}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    ) RETURNING id INTO client_user_id;
    
    -- Inserisci il profilo cliente
    INSERT INTO profiles (id, email, name, role, is_active, created_at, updated_at)
    VALUES (client_user_id, 'itsilorenz07@gmail.com', 'Cliente Test', 'client', true, now(), now());
    
    RAISE NOTICE 'Cliente creato con ID: %', client_user_id;
END $$;

-- FASE 5: CONFIGURAZIONE RLS POLICIES
-- =====================================================

-- 5.1 Abilita RLS sulla tabella profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5.2 Rimuovi tutte le policy esistenti per evitare conflitti
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authorized coaches can manage all users" ON profiles;

-- 5.3 Crea le nuove policy RLS

-- Policy 1: Gli utenti possono vedere solo il proprio profilo ATTIVO
CREATE POLICY "Users can view own active profile" ON profiles
    FOR SELECT USING (
        auth.uid() = id AND is_active = true
    );

-- Policy 2: Gli utenti possono aggiornare solo il proprio profilo ATTIVO
CREATE POLICY "Users can update own active profile" ON profiles
    FOR UPDATE USING (
        auth.uid() = id AND is_active = true
    );

-- Policy 3: Gli utenti possono inserire solo il proprio profilo
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id
    );

-- Policy 4: I coach autorizzati possono vedere TUTTI i profili
CREATE POLICY "Authorized coaches can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND email = 'loerstudio0@gmail.com' 
            AND role = 'coach' 
            AND is_active = true
        )
    );

-- Policy 5: I coach autorizzati possono aggiornare TUTTI i profili
CREATE POLICY "Authorized coaches can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND email = 'loerstudio0@gmail.com' 
            AND role = 'coach' 
            AND is_active = true
        )
    );

-- Policy 6: I coach autorizzati possono inserire nuovi profili
CREATE POLICY "Authorized coaches can insert profiles" ON profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND email = 'loerstudio0@gmail.com' 
            AND role = 'coach' 
            AND is_active = true
        )
    );

-- Policy 7: I coach autorizzati possono eliminare profili
CREATE POLICY "Authorized coaches can delete profiles" ON profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND email = 'loerstudio0@gmail.com' 
            AND role = 'coach' 
            AND is_active = true
        )
    );

-- FASE 6: VERIFICA FINALE
-- =====================================================

-- 6.1 Verifica che gli utenti siano stati creati
SELECT 
    'UTENTI CREATI' as verifica,
    id,
    email,
    name,
    role,
    is_active,
    created_at
FROM profiles 
WHERE email IN ('loerstudio0@gmail.com', 'itsilorenz07@gmail.com')
ORDER BY role;

-- 6.2 Verifica la struttura della tabella profiles
SELECT 
    'STRUTTURA TABELLA' as verifica,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 6.3 Verifica le policy RLS attive
SELECT 
    'POLICY RLS' as verifica,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 6.4 Verifica che RLS sia abilitato
SELECT 
    'RLS STATUS' as verifica,
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- FASE 7: MESSAGGIO DI SUCCESSO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'SISTEMA INIZIALIZZATO CON SUCCESSO!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Coach: loerstudio0@gmail.com (Password: CoachPassword123!)';
    RAISE NOTICE 'Cliente: itsilorenz07@gmail.com (Password: ClientPassword123!)';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Prossimi passi:';
    RAISE NOTICE '1. Testa il login con le credenziali sopra';
    RAISE NOTICE '2. Verifica che il coach possa accedere alla gestione utenti';
    RAISE NOTICE '3. Testa la creazione di nuovi utenti';
    RAISE NOTICE '=====================================================';
END $$;
