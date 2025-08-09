// 🚀 Script per creare i primi utenti SimoPagno Coaching
// Esegui questo script per creare utente coach e cliente di test

const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

// Crea client Supabase con service role (per bypassare RLS)
const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);

async function createFirstUsers() {
  console.log('🚀 Creazione primi utenti SimoPagno Coaching...\n');

  try {
    // 1. CREA UTENTE COACH
    console.log('👨‍💼 Creazione utente COACH...');
    
    const coachData = config.users.coach;

    // Registra l'utente in Supabase Auth
    const { data: coachAuth, error: coachAuthError } = await supabase.auth.admin.createUser({
      email: coachData.email,
      password: coachData.password,
      email_confirm: true, // Conferma email automaticamente
      user_metadata: {
        name: coachData.name,
        role: coachData.role
      }
    });

    if (coachAuthError) {
      console.error('❌ Errore nella creazione utente coach:', coachAuthError);
      return;
    }

    console.log('✅ Utente coach creato in Auth:', coachAuth.user.id);

    // Crea il profilo coach nella tabella profiles
    const { data: coachProfile, error: coachProfileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: coachAuth.user.id,
          email: coachData.email,
          name: coachData.name,
          role: coachData.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (coachProfileError) {
      console.error('❌ Errore nella creazione profilo coach:', coachProfileError);
      return;
    }

    console.log('✅ Profilo coach creato:', coachProfile);
    console.log('👨‍💼 COACH creato con successo!\n');

    // 2. CREA UTENTE CLIENTE
    console.log('👤 Creazione utente CLIENTE...');
    
    const clientData = config.users.client;

    // Registra l'utente in Supabase Auth
    const { data: clientAuth, error: clientAuthError } = await supabase.auth.admin.createUser({
      email: clientData.email,
      password: clientData.password,
      email_confirm: true, // Conferma email automaticamente
      user_metadata: {
        name: clientData.name,
        role: clientData.role
      }
    });

    if (clientAuthError) {
      console.error('❌ Errore nella creazione utente cliente:', clientAuthError);
      return;
    }

    console.log('✅ Utente cliente creato in Auth:', clientAuth.user.id);

    // Crea il profilo cliente nella tabella profiles
    const { data: clientProfile, error: clientProfileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: clientAuth.user.id,
          email: clientData.email,
          name: clientData.name,
          role: clientData.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (clientProfileError) {
      console.error('❌ Errore nella creazione profilo cliente:', clientProfileError);
      return;
    }

    console.log('✅ Profilo cliente creato:', clientProfile);
    console.log('👤 CLIENTE creato con successo!\n');

    // 3. CREA UNA CHAT TRA COACH E CLIENTE
    console.log('💬 Creazione chat tra coach e cliente...');
    
    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .insert([
        {
          coach_id: coachAuth.user.id,
          client_id: clientAuth.user.id,
          last_message_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (chatError) {
      console.error('❌ Errore nella creazione chat:', chatError);
      return;
    }

    console.log('✅ Chat creata:', chat.id);

    // 4. CREA UN MESSAGGIO DI BENVENUTO
    console.log('📝 Creazione messaggio di benvenuto...');
    
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([
        {
          chat_id: chat.id,
          sender_id: coachAuth.user.id,
          content: config.welcomeMessage,
          message_type: 'text',
          is_read: false,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (messageError) {
      console.error('❌ Errore nella creazione messaggio:', messageError);
      return;
    }

    console.log('✅ Messaggio di benvenuto creato');

    // 5. RIEPILOGO FINALE
    console.log('\n🎉 RIEPILOGO UTENTI CREATI:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👨‍💼 COACH:');
    console.log(`   Email: ${coachData.email}`);
    console.log(`   Password: ${coachData.password}`);
    console.log(`   Nome: ${coachData.name}`);
    console.log(`   ID: ${coachAuth.user.id}`);
    console.log('');
    console.log('👤 CLIENTE:');
    console.log(`   Email: ${clientData.email}`);
    console.log(`   Password: ${clientData.password}`);
    console.log(`   Nome: ${clientData.name}`);
    console.log(`   ID: ${clientAuth.user.id}`);
    console.log('');
    console.log('💬 CHAT:');
    console.log(`   ID: ${chat.id}`);
    console.log(`   Coach: ${coachData.name}`);
    console.log(`   Cliente: ${clientData.name}`);
    console.log('');
    console.log('📝 MESSAGGIO:');
    console.log(`   Contenuto: ${config.welcomeMessage}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ Tutti gli utenti sono stati creati con successo!');
    console.log('🚀 Ora puoi testare l\'autenticazione nell\'app!');

  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

// Esegui la funzione
createFirstUsers();
