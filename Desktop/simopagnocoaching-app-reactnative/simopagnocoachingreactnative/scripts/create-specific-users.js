const { createClient } = require('@supabase/supabase-js');
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

// Utenti specifici da creare
const usersToCreate = [
  {
    email: 'loerstudio0@gmail.com',
    password: 'Coach123!',
    name: 'Loer Studio Coach',
    role: 'coach'
  },
  {
    email: 'cliente1@example.com',
    password: 'Cliente123!',
    name: 'Mario Rossi',
    role: 'client'
  },
  {
    email: 'cliente2@example.com',
    password: 'Cliente123!',
    name: 'Giulia Bianchi',
    role: 'client'
  }
];

async function createSpecificUsers() {
  try {
    console.log('🚀 CREAZIONE UTENTI SPECIFICI\n');
    
    const createdUsers = [];

    for (const userData of usersToCreate) {
      console.log(`👤 Creazione ${userData.role}: ${userData.name} (${userData.email})`);
      
      // 1. Crea utente in auth.users
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          role: userData.role
        }
      });

      if (authError) {
        console.error(`❌ Errore creazione auth per ${userData.email}:`, authError.message);
        continue;
      }

      console.log(`✅ ${userData.role} creato in auth.users con ID:`, authData.user.id);

      // 2. Crea profilo nella tabella profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role
        })
        .select()
        .single();

      if (profileError) {
        console.error(`❌ Errore creazione profilo per ${userData.email}:`, profileError.message);
        continue;
      }

      console.log(`✅ Profilo ${userData.role} creato:`, profile);
      
      createdUsers.push({
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      });
    }

    if (createdUsers.length === 0) {
      console.log('❌ Nessun utente creato');
      return;
    }

    // 3. Crea chat tra coach e clienti
    const coach = createdUsers.find(u => u.role === 'coach');
    const clients = createdUsers.filter(u => u.role === 'client');

    if (coach && clients.length > 0) {
      console.log('\n💬 Creazione chat tra coach e clienti...');
      
      for (const client of clients) {
        const { data: chat, error: chatError } = await supabase
          .from('chats')
          .insert({
            coach_id: coach.id,
            client_id: client.id
          })
          .select()
          .single();

        if (chatError) {
          console.error(`❌ Errore creazione chat con ${client.name}:`, chatError.message);
        } else {
          console.log(`✅ Chat creata tra ${coach.name} e ${client.name}`);
          
          // 4. Crea messaggio di benvenuto
          const { error: messageError } = await supabase
            .from('messages')
            .insert({
              chat_id: chat.id,
              sender_id: coach.id,
              content: `Ciao ${client.name}! Sono ${coach.name}, il tuo coach personale. Iniziamo questo percorso insieme! 💪`,
              message_type: 'text'
            });

          if (messageError) {
            console.error(`❌ Errore creazione messaggio per ${client.name}:`, messageError.message);
          } else {
            console.log(`✅ Messaggio di benvenuto inviato a ${client.name}`);
          }
        }
      }
    }

    console.log('\n🎉 CREAZIONE UTENTI COMPLETATA CON SUCCESSO!');
    console.log('\n📋 Riepilogo utenti creati:');
    createdUsers.forEach(user => {
      console.log(`${user.role === 'coach' ? '👨‍💼' : '👤'} ${user.name}: ${user.email}`);
    });
    
    console.log('\n🔑 Credenziali per il login:');
    createdUsers.forEach(user => {
      const password = user.password || (user.role === 'coach' ? 'Coach123!' : 'Cliente123!');
      console.log(`${user.email} / ${password}`);
    });

  } catch (error) {
    console.error('❌ Errore generale:', error.message);
  }
}

// Esegui lo script
createSpecificUsers();
