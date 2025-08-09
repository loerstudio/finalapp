const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = 'https://mlltbyzjeoakfculpvrg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sbHRieXpqZW9ha2ZjdWxwdnJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY0MzU2NywiZXhwIjoyMDcwMjE5NTY3fQ.nEK6jA3jfqJDWRr2Py8-nTSQUsV5sT3ViPdEp4w9PPo';

console.log('🔍 Test connessione Supabase...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('\n🚀 Test connessione...');
    
    // Test 1: Connessione base
    console.log('1️⃣ Test connessione base...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Errore connessione:', error.message);
      return;
    }
    
    console.log('✅ Connessione riuscita!');
    console.log('Data ricevuta:', data);
    
    // Test 2: Verifica tabelle
    console.log('\n2️⃣ Verifica tabelle disponibili...');
    const tables = ['profiles', 'chats', 'messages', 'exercises', 'workouts', 'workout_exercises'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.log(`❌ Tabella ${table}:`, error.message);
        } else {
          console.log(`✅ Tabella ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Tabella ${table}:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Errore generale:', error.message);
  }
}

testConnection();
