#!/usr/bin/env node

/**
 * Script per configurare le impostazioni di autenticazione Supabase
 * Risolve i warning: OTP Expiry e Password Protection
 */

const https = require('https');

// Configurazione del progetto
const PROJECT_REF = 'mlltbyzjeoakfculpvrg';
const ACCESS_TOKEN = 'sbp_2077e1f6974fff0038d537234f0946bcfa60a07d';

// Funzione per fare richieste HTTP
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
        } catch (error) {
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

// Funzione per configurare l'OTP expiry
async function configureOTPExpiry() {
  console.log('🔧 Configurazione OTP Expiry...');
  
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;
  const options = {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  // Configurazione per OTP expiry di 10 minuti (600 secondi)
  const data = {
    "email_otp_expiry": 600  // 10 minuti in secondi
  };

  try {
    const response = await makeRequest(url, options, data);
    if (response.status === 200) {
      console.log('✅ OTP Expiry configurato a 600 secondi (10 minuti)');
      return true;
    } else {
      console.log('❌ Errore nella configurazione OTP Expiry:', response.status, response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Errore nella richiesta OTP Expiry:', error.message);
    return false;
  }
}

// Funzione per configurare la password protection
async function configurePasswordProtection() {
  console.log('🔧 Configurazione Password Protection...');
  
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;
  const options = {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  // Configurazione per abilitare la protezione contro password compromesse
  const data = {
    "password_require_uppercase": true,
    "password_require_lowercase": true,
    "password_require_numbers": true,
    "password_require_special_chars": true,
    "password_min_length": 8,
    "password_require_strong_password": true  // Abilita la protezione HaveIBeenPwned
  };

  try {
    const response = await makeRequest(url, options, data);
    if (response.status === 200) {
      console.log('✅ Password Protection configurata con successo');
      console.log('   - Lunghezza minima: 8 caratteri');
      console.log('   - Richiede maiuscole, minuscole, numeri e caratteri speciali');
      console.log('   - Protezione contro password compromesse abilitata');
      return true;
    } else {
      console.log('❌ Errore nella configurazione Password Protection:', response.status, response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Errore nella richiesta Password Protection:', error.message);
    return false;
  }
}

// Funzione per verificare le configurazioni attuali
async function checkCurrentConfig() {
  console.log('🔍 Verifica configurazioni attuali...');
  
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;
  const options = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(url, options);
    if (response.status === 200) {
      console.log('📊 Configurazioni attuali:');
      console.log('   - OTP Expiry:', response.data.email_otp_expiry || 'Non configurato', 'secondi');
      console.log('   - Password Min Length:', response.data.password_min_length || 'Non configurato');
      console.log('   - Strong Password:', response.data.password_require_strong_password ? 'Abilitato' : 'Disabilitato');
      return response.data;
    } else {
      console.log('❌ Errore nel recupero configurazioni:', response.status, response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Errore nella richiesta configurazioni:', error.message);
    return null;
  }
}

// Funzione principale
async function main() {
  console.log('🚀 Inizio configurazione impostazioni autenticazione Supabase');
  console.log('📋 Progetto:', PROJECT_REF);
  console.log('');

  // Verifica configurazioni attuali
  const currentConfig = await checkCurrentConfig();
  console.log('');

  // Configura OTP expiry
  const otpSuccess = await configureOTPExpiry();
  console.log('');

  // Configura password protection
  const passwordSuccess = await configurePasswordProtection();
  console.log('');

  // Verifica finale
  if (otpSuccess && passwordSuccess) {
    console.log('✅ Configurazione completata con successo!');
    console.log('');
    console.log('🔍 Verifica finale delle configurazioni...');
    await checkCurrentConfig();
    console.log('');
    console.log('🎉 I warning dovrebbero essere risolti!');
    console.log('   - OTP Expiry: configurato a 10 minuti');
    console.log('   - Password Protection: abilitata con protezione HaveIBeenPwned');
  } else {
    console.log('❌ Configurazione non completata completamente');
    console.log('   Controlla i log sopra per i dettagli degli errori');
  }
}

// Esegui lo script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { configureOTPExpiry, configurePasswordProtection, checkCurrentConfig };
