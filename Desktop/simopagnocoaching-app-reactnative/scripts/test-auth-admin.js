const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = 'https://mlltbyzjeoakfculpvrg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sbHRieXpqZW9ha2ZjdWxwdnJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY0MzU2NywiZXhwIjoyMDcwMjE5NTY3fQ.nEK6jA3jfqJDWRr2Py8-nTSQUsV5sT3ViPdEp4w9PPo';

console.log('🔍 Test Auth Admin Supabase...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testAuthAdmin() {
  try {
    console.log('\n🚀 Test Auth Admin...');
    
    // Test 1: Verifica connessione base
    console.log('1️⃣ Test connessione base...');
    const { data: testData, error: testError } = await supabase.from('profiles').select('count').limit(1);
    
    if (testError) {
      console.error('❌ Errore connessione base:', testError.message);
      return;
    }
    
    console.log('✅ Connessione base OK');
    
    // Test 2: Verifica se l'auth admin è disponibile
    console.log('\n2️⃣ Test disponibilità auth admin...');
    
    if (!supabase.auth.admin) {
      console.error('❌ Auth admin non disponibile');
      console.log('Versione Supabase:', require('@supabase/supabase-js/package.json').version);
      return;
    }
    
    console.log('✅ Auth admin disponibile');
    
    // Test 3: Prova a creare un utente di test
    console.log('\n3️⃣ Test creazione utente...');
    
    const testUserData = {
      email: 'test@example.com',
      password: 'Test123!',
      email_confirm: true,
      user_metadata: {
        name: 'Test User',
        role: 'client'
      }
    };
    
    console.log('Dati utente test:', testUserData);
    
    const { data: userData, error: userError } = await supabase.auth.admin.createUser(testUserData);
    
    if (userError) {
      console.error('❌ Errore creazione utente:', userError.message);
      console.error('Status:', userError.status);
      console.error('Code:', userError.code);
      console.error('Details:', userError);
      return;
    }
    
    console.log('✅ Utente test creato con successo!');
    console.log('User ID:', userData.user.id);
    console.log('Email:', userData.user.email);
    
    // Test 4: Elimina l'utente di test
    console.log('\n4️⃣ Pulizia - Eliminazione utente test...');
    
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userData.user.id);
    
    if (deleteError) {
      console.error('⚠️ Errore eliminazione utente test:', deleteError.message);
    } else {
      console.log('✅ Utente test eliminato');
    }
    
  } catch (error) {
    console.error('❌ Errore generale:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAuthAdmin();
