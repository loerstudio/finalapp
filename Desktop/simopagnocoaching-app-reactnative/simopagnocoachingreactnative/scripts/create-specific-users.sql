-- 🚀 Script per creare utenti specifici con ruoli distinti
-- Esegui questo script nel SQL Editor di Supabase

-- 1. Crea utente Coach (loerstudio0@gmail.com)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'loerstudio0@gmail.com',
  crypt('Coach123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"], "role": "coach"}',
  '{"name": "Loer Studio Coach", "role": "coach"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- 2. Ottieni l'ID dell'utente coach appena creato
DO $$
DECLARE
  coach_user_id UUID;
BEGIN
  SELECT id INTO coach_user_id FROM auth.users WHERE email = 'loerstudio0@gmail.com';
  
  -- 3. Crea il profilo coach
  INSERT INTO profiles (id, email, name, role, created_at, updated_at)
  VALUES (
    coach_user_id,
    'loerstudio0@gmail.com',
    'Loer Studio Coach',
    'coach',
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Coach creato con ID: %', coach_user_id;
END $$;

-- 4. Crea alcuni utenti clienti di esempio
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
  (
    gen_random_uuid(),
    'cliente1@example.com',
    crypt('Cliente123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"], "role": "client"}',
    '{"name": "Mario Rossi", "role": "client"}',
    false,
    '',
    '',
    '',
    ''
  ),
  (
    gen_random_uuid(),
    'cliente2@example.com',
    crypt('Cliente123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"], "role": "client"}',
    '{"name": "Giulia Bianchi", "role": "client"}',
    false,
    '',
    '',
    '',
    ''
  )
ON CONFLICT (email) DO NOTHING;

-- 5. Crea i profili per i clienti
DO $$
DECLARE
  cliente1_id UUID;
  cliente2_id UUID;
  coach_id UUID;
BEGIN
  -- Ottieni gli ID degli utenti
  SELECT id INTO coach_id FROM auth.users WHERE email = 'loerstudio0@gmail.com';
  SELECT id INTO cliente1_id FROM auth.users WHERE email = 'cliente1@example.com';
  SELECT id INTO cliente2_id FROM auth.users WHERE email = 'cliente2@example.com';
  
  -- Crea profili clienti
  INSERT INTO profiles (id, email, name, role, created_at, updated_at)
  VALUES 
    (cliente1_id, 'cliente1@example.com', 'Mario Rossi', 'client', NOW(), NOW()),
    (cliente2_id, 'cliente2@example.com', 'Giulia Bianchi', 'client', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  
  -- 6. Crea chat tra coach e clienti
  INSERT INTO chats (coach_id, client_id, created_at, last_message_at)
  VALUES 
    (coach_id, cliente1_id, NOW(), NOW()),
    (coach_id, cliente2_id, NOW(), NOW())
  ON CONFLICT DO NOTHING;
  
  -- 7. Crea messaggi di benvenuto
  INSERT INTO messages (chat_id, sender_id, content, message_type, created_at)
  SELECT 
    c.id,
    coach_id,
    'Ciao! Sono il tuo coach personale. Iniziamo questo percorso insieme! 💪',
    'text',
    NOW()
  FROM chats c 
  WHERE c.coach_id = coach_id;
  
  RAISE NOTICE 'Utenti e chat creati con successo!';
END $$;

-- ✅ Messaggio di conferma
SELECT '🎉 Utenti specifici creati con successo!' as status;
