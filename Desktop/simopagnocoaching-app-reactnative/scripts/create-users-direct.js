const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = 'https://mlltbyzjeoakfculpvrg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sbHRieXpqZW9ha2ZjdWxwdnJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY0MzU2NywiZXhwIjoyMDcwMjE5NTY3fQ.nEK6jA3jfqJDWRr2Py8-nTSQUsV5sT3ViPdEp4w9PPo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUsersDirect() {
  try {
    console.log('🚀 Creazione utenti direttamente nel database...\n');

    // Genera UUID per i nuovi utenti
    const coachId = '550e8400-e29b-41d4-a716-446655440001';
    const clientId = '550e8400-e29b-41d4-a716-446655440002';

    // 1. Crea profilo Coach
    console.log('👨‍💼 Creazione profilo Coach...');
    const { data: coachProfile, error: coachProfileError } = await supabase
      .from('profiles')
      .insert({
        id: coachId,
        email: 'loerstudio0@gmail.com',
        name: 'Loer 0 coach',
        role: 'coach'
      })
      .select()
      .single();

    if (coachProfileError) {
      console.error('❌ Errore creazione profilo coach:', coachProfileError.message);
      return;
    }

    console.log('✅ Profilo coach creato:', coachProfile);

    // 2. Crea profilo Cliente
    console.log('\n👤 Creazione profilo Cliente...');
    const { data: clientProfile, error: clientProfileError } = await supabase
      .from('profiles')
      .insert({
        id: clientId,
        email: 'itsilorenz07@gmail.com',
        name: 'Lorenzo cliente',
        role: 'client'
      })
      .select()
      .single();

    if (clientProfileError) {
      console.error('❌ Errore creazione profilo cliente:', clientProfileError.message);
      return;
    }

    console.log('✅ Profilo cliente creato:', clientProfile);

    // 3. Crea una chat tra coach e cliente
    console.log('\n💬 Creazione chat tra coach e cliente...');
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert({
        coach_id: coachId,
        client_id: clientId
      })
      .select()
      .single();

    if (chatError) {
      console.error('❌ Errore creazione chat:', chatError.message);
      return;
    }

    console.log('✅ Chat creata:', chat);

    // 4. Crea un messaggio di benvenuto
    console.log('\n📝 Creazione messaggio di benvenuto...');
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        chat_id: chat.id,
        sender_id: coachId,
        content: 'Ciao Lorenzo! Sono Loer, il tuo coach personale. Iniziamo questo percorso insieme! 💪',
        message_type: 'text'
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Errore creazione messaggio:', messageError.message);
      return;
    }

    console.log('✅ Messaggio di benvenuto creato:', message);

    console.log('\n🎉 CREAZIONE UTENTI COMPLETATA CON SUCCESSO!');
    console.log('\n📋 Riepilogo:');
    console.log('👨‍💼 Coach: Loer 0 coach (loerstudio0@gmail.com)');
    console.log('👤 Cliente: Lorenzo cliente (itsilorenz07@gmail.com)');
    console.log('💬 Chat creata tra coach e cliente');
    console.log('📝 Messaggio di benvenuto inviato');
    
    console.log('\n⚠️  IMPORTANTE:');
    console.log('Gli utenti sono stati creati solo nei profili del database.');
    console.log('Per completare la configurazione, devi creare gli account auth manualmente:');
    console.log('1. Vai su Supabase Dashboard > Authentication > Users');
    console.log('2. Clicca "Add User"');
    console.log('3. Inserisci:');
    console.log('   - Coach: loerstudio0@gmail.com / Coach123!');
    console.log('   - Cliente: itsilorenz07@gmail.com / ItsIlor1');
    console.log('4. Assicurati che gli ID degli utenti auth corrispondano a quelli nei profili');

  } catch (error) {
    console.error('❌ Errore generale:', error.message);
  }
}

createUsersDirect();
