const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
require('dotenv').config();

// Configurazione Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  console.error('Assicurati di avere SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nel file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Interfaccia per input utente
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createCustomUsers() {
  try {
    console.log('🚀 CREAZIONE UTENTI PERSONALIZZATI\n');
    console.log('Inserisci i dati per creare Coach e Cliente\n');

    // Input dati Coach
    console.log('👨‍💼 DATI COACH:');
    const coachEmail = await question('📧 Email del coach: ');
    const coachPassword = await question('🔑 Password del coach: ');
    const coachName = await question('👤 Nome del coach: ');

    // Input dati Cliente
    console.log('\n👤 DATI CLIENTE:');
    const clientEmail = await question('📧 Email del cliente: ');
    const clientPassword = await question('🔑 Password del cliente: ');
    const clientName = await question('👤 Nome del cliente: ');

    // Conferma
    console.log('\n📋 RIEPILOGO DATI:');
    console.log('👨‍💼 Coach:', coachName, `(${coachEmail})`);
    console.log('👤 Cliente:', clientName, `(${clientEmail})`);
    
    const confirm = await question('\n✅ Confermi la creazione? (y/n): ');
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ Creazione annullata');
      rl.close();
      return;
    }

    console.log('\n🚀 Inizializzazione creazione utenti...\n');

    // 1. Crea utente Coach
    console.log('👨‍💼 Creazione utente Coach...');
    const { data: coachAuth, error: coachAuthError } = await supabase.auth.admin.createUser({
      email: coachEmail,
      password: coachPassword,
      email_confirm: true,
      user_metadata: {
        name: coachName,
        role: 'coach'
      }
    });

    if (coachAuthError) {
      console.error('❌ Errore creazione auth coach:', coachAuthError.message);
      rl.close();
      return;
    }

    console.log('✅ Coach creato in auth.users con ID:', coachAuth.user.id);

    // 2. Crea profilo Coach
    const { data: coachProfile, error: coachProfileError } = await supabase
      .from('profiles')
      .insert({
        id: coachAuth.user.id,
        email: coachEmail,
        name: coachName,
        role: 'coach'
      })
      .select()
      .single();

    if (coachProfileError) {
      console.error('❌ Errore creazione profilo coach:', coachProfileError.message);
      rl.close();
      return;
    }

    console.log('✅ Profilo coach creato:', coachProfile);

    // 3. Crea utente Cliente
    console.log('\n👤 Creazione utente Cliente...');
    const { data: clientAuth, error: clientAuthError } = await supabase.auth.admin.createUser({
      email: clientEmail,
      password: clientPassword,
      email_confirm: true,
      user_metadata: {
        name: clientName,
        role: 'client'
      }
    });

    if (clientAuthError) {
      console.error('❌ Errore creazione auth cliente:', clientAuthError.message);
      rl.close();
      return;
    }

    console.log('✅ Cliente creato in auth.users con ID:', clientAuth.user.id);

    // 4. Crea profilo Cliente
    const { data: clientProfile, error: clientProfileError } = await supabase
      .from('profiles')
      .insert({
        id: clientAuth.user.id,
        email: clientEmail,
        name: clientName,
        role: 'client'
      })
      .select()
      .single();

    if (clientProfileError) {
      console.error('❌ Errore creazione profilo cliente:', clientProfileError.message);
      rl.close();
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
      rl.close();
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
        content: `Ciao ${clientName}! Sono ${coachName}, il tuo coach personale. Iniziamo questo percorso insieme! 💪`,
        message_type: 'text'
      })
      .select()
      .single();

    if (messageError) {
      console.error('❌ Errore creazione messaggio:', messageError.message);
      rl.close();
      return;
    }

    console.log('✅ Messaggio di benvenuto creato:', message);

    console.log('\n🎉 CREAZIONE UTENTI COMPLETATA CON SUCCESSO!');
    console.log('\n📋 Riepilogo:');
    console.log(`👨‍💼 Coach: ${coachName} (${coachEmail})`);
    console.log(`👤 Cliente: ${clientName} (${clientEmail})`);
    console.log('💬 Chat creata tra coach e cliente');
    console.log('📝 Messaggio di benvenuto inviato');
    
    console.log('\n🔑 Credenziali per il login:');
    console.log(`Coach: ${coachEmail} / ${coachPassword}`);
    console.log(`Cliente: ${clientEmail} / ${clientPassword}`);

  } catch (error) {
    console.error('❌ Errore generale:', error.message);
  } finally {
    rl.close();
  }
}

// Esegui lo script
createCustomUsers();
