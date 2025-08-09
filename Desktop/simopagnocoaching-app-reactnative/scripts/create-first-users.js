const { createClient } = require('@supabase/supabase-js');

// Configurazione Supabase
const supabaseUrl = 'https://mlltbyzjeoakfculpvrg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sbHRieXpqZW9ha2ZjdWxwdnJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsInJlZiI6Im1sbHRieXpqZW9ha2ZjdWxwdnJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY0MzU2NywiZXhwIjoyMDcwMjE5NTY3fQ.nEK6jA3jfqJDWRr2Py8-nTSQUsV5sT3ViPdEp4w9PPo';

// Le credenziali sono già inserite nel codice

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createFirstUsers() {
  try {
    console.log('🚀 Inizializzazione creazione utenti...\n');

    // 1. Crea utente Coach
    console.log('👨‍💼 Creazione utente Coach...');
    const { data: coachAuth, error: coachAuthError } = await supabase.auth.admin.createUser({
      email: 'loerstudio0@gmail.com',
      password: 'Coach123!',
      email_confirm: true,
      user_metadata: {
        name: 'Loer 0 coach',
        role: 'coach'
      }
    });

    if (coachAuthError) {
      console.error('❌ Errore creazione auth coach:', coachAuthError.message);
      return;
    }

    console.log('✅ Coach creato in auth.users con ID:', coachAuth.user.id);

    // 2. Crea profilo Coach
    const { data: coachProfile, error: coachProfileError } = await supabase
      .from('profiles')
      .insert({
        id: coachAuth.user.id,
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

    // 3. Crea utente Cliente
    console.log('\n👤 Creazione utente Cliente...');
    const { data: clientAuth, error: clientAuthError } = await supabase.auth.admin.createUser({
      email: 'itsilorenz07@gmail.com',
      password: 'ItsIlor1',
      email_confirm: true,
      user_metadata: {
        name: 'Lorenzo cliente',
        role: 'client'
      }
    });

    if (clientAuthError) {
      console.error('❌ Errore creazione auth cliente:', clientAuthError.message);
      return;
    }

    console.log('✅ Cliente creato in auth.users con ID:', clientAuth.user.id);

    // 4. Crea profilo Cliente
    const { data: clientProfile, error: clientProfileError } = await supabase
      .from('profiles')
      .insert({
        id: clientAuth.user.id,
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

    // 5. Crea una chat tra coach e cliente
    console.log('\n💬 Creazione chat tra coach e cliente...');
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert({
        coach_id: coachAuth.user.id,
        client_id: clientAuth.user.id
      })
      .select()
      .single();

    if (chatError) {
      console.error('❌ Errore creazione chat:', chatError.message);
      return;
    }

    console.log('✅ Chat creata:', chat);

    // 6. Crea un messaggio di benvenuto
    console.log('\n📝 Creazione messaggio di benvenuto...');
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        chat_id: chat.id,
        sender_id: coachAuth.user.id,
        content: 'Benvenuto! Sono Simone, il tuo coach personale. Iniziamo questo percorso insieme! 💪',
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
    console.log('👨‍💼 Coach: Loer 0 coach (loerstudio0@gmail.com) - Password: Coach123!');
    console.log('👤 Cliente: Lorenzo cliente (itsilorenz07@gmail.com) - Password: ItsIlor1');
    console.log('💬 Chat creata tra coach e cliente');
    console.log('📝 Messaggio di benvenuto inviato');
    
    console.log('\n🔑 Credenziali per il login:');
    console.log('Coach: loerstudio0@gmail.com / Coach123!');
    console.log('Cliente: itsilorenz07@gmail.com / ItsIlor1');

  } catch (error) {
    console.error('❌ Errore generale:', error.message);
  }
}

// Esegui lo script
createFirstUsers();
