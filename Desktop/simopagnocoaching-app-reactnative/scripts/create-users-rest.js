const https = require('https');

// Configurazione Supabase
const supabaseUrl = 'https://mlltbyzjeoakfculpvrg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sbHRieXpqZW9ha2ZjdWxwdnJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY0MzU2NywiZXhwIjoyMDcwMjE5NTY3fQ.nEK6jA3jfqJDWRr2Py8-nTSQUsV5sT3ViPdEp4w9PPo';

function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function createUsersWithREST() {
  try {
    console.log('🚀 Creazione utenti tramite REST API...\n');

    // 1. Crea utente Coach
    console.log('👨‍💼 Creazione utente Coach...');
    const coachData = {
      email: 'loerstudio0@gmail.com',
      password: 'Coach123!',
      email_confirm: true,
      user_metadata: {
        name: 'Loer 0 coach',
        role: 'coach'
      }
    };

    const coachResponse = await makeRequest(
      `${supabaseUrl}/auth/v1/admin/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        }
      },
      coachData
    );

    console.log('Coach response status:', coachResponse.status);
    console.log('Coach response:', coachResponse.data);

    if (coachResponse.status !== 200) {
      console.error('❌ Errore creazione coach:', coachResponse.data);
      return;
    }

    const coachId = coachResponse.data.id;
    console.log('✅ Coach creato con ID:', coachId);

    // 2. Crea profilo Coach
    console.log('\n📝 Creazione profilo coach...');
    const coachProfileData = {
      id: coachId,
      email: 'loerstudio0@gmail.com',
      name: 'Loer 0 coach',
      role: 'coach'
    };

    const coachProfileResponse = await makeRequest(
      `${supabaseUrl}/rest/v1/profiles`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Prefer': 'return=representation'
        }
      },
      coachProfileData
    );

    console.log('Coach profile response status:', coachProfileResponse.status);
    if (coachProfileResponse.status === 201) {
      console.log('✅ Profilo coach creato');
    } else {
      console.error('❌ Errore profilo coach:', coachProfileResponse.data);
    }

    // 3. Crea utente Cliente
    console.log('\n👤 Creazione utente Cliente...');
    const clientData = {
      email: 'itsilorenz07@gmail.com',
      password: 'ItsIlor1',
      email_confirm: true,
      user_metadata: {
        name: 'Lorenzo cliente',
        role: 'client'
      }
    };

    const clientResponse = await makeRequest(
      `${supabaseUrl}/auth/v1/admin/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        }
      },
      clientData
    );

    console.log('Client response status:', clientResponse.status);
    console.log('Client response:', clientResponse.data);

    if (clientResponse.status !== 200) {
      console.error('❌ Errore creazione cliente:', clientResponse.data);
      return;
    }

    const clientId = clientResponse.data.id;
    console.log('✅ Cliente creato con ID:', clientId);

    // 4. Crea profilo Cliente
    console.log('\n📝 Creazione profilo cliente...');
    const clientProfileData = {
      id: clientId,
      email: 'itsilorenz07@gmail.com',
      name: 'Lorenzo cliente',
      role: 'client'
    };

    const clientProfileResponse = await makeRequest(
      `${supabaseUrl}/rest/v1/profiles`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Prefer': 'return=representation'
        }
      },
      clientProfileData
    );

    console.log('Client profile response status:', clientProfileResponse.status);
    if (clientProfileResponse.status === 201) {
      console.log('✅ Profilo cliente creato');
    } else {
      console.error('❌ Errore profilo cliente:', clientProfileResponse.data);
    }

    // 5. Crea chat
    console.log('\n💬 Creazione chat...');
    const chatData = {
      coach_id: coachId,
      client_id: clientId
    };

    const chatResponse = await makeRequest(
      `${supabaseUrl}/rest/v1/chats`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Prefer': 'return=representation'
        }
      },
      chatData
    );

    if (chatResponse.status === 201) {
      console.log('✅ Chat creata');
      const chatId = chatResponse.data[0].id;

      // 6. Crea messaggio di benvenuto
      console.log('\n📝 Creazione messaggio di benvenuto...');
      const messageData = {
        chat_id: chatId,
        sender_id: coachId,
        content: 'Ciao Lorenzo! Sono Loer, il tuo coach personale. Iniziamo questo percorso insieme! 💪',
        message_type: 'text'
      };

      const messageResponse = await makeRequest(
        `${supabaseUrl}/rest/v1/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
            'Prefer': 'return=representation'
          }
        },
        messageData
      );

      if (messageResponse.status === 201) {
        console.log('✅ Messaggio di benvenuto creato');
      } else {
        console.error('❌ Errore messaggio:', messageResponse.data);
      }
    } else {
      console.error('❌ Errore chat:', chatResponse.data);
    }

    console.log('\n🎉 CREAZIONE UTENTI COMPLETATA!');
    console.log('\n🔑 Credenziali per il login:');
    console.log('Coach: loerstudio0@gmail.com / Coach123!');
    console.log('Cliente: itsilorenz07@gmail.com / ItsIlor1');

  } catch (error) {
    console.error('❌ Errore generale:', error.message);
  }
}

createUsersWithREST();
