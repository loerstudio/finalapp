/**
 * Test Script per verificare la sicurezza del sistema OTP
 * Verifica che l'OTP venga inviato SOLO alle email esistenti nel database
 */

import { supabaseAuthService } from '../lib/supabaseAuthService.js';
import { supabase } from '../lib/supabase.js';

async function testOTPSecurity() {
  console.log('🔒 Test Sicurezza Sistema OTP');
  console.log('================================\n');

  // Test 1: Email esistente nel database
  console.log('📧 Test 1: Email esistente nel database');
  try {
    const result = await supabaseAuthService.loginWithOTP('test@example.com');
    console.log('Risultato:', result);
    if (result.success) {
      console.log('✅ OTP inviato correttamente a email esistente');
    } else {
      console.log('❌ OTP non inviato:', result.error);
    }
  } catch (error) {
    console.log('❌ Errore nel test:', error.message);
  }
  console.log('');

  // Test 2: Email NON esistente nel database
  console.log('📧 Test 2: Email NON esistente nel database');
  try {
    const result = await supabaseAuthService.loginWithOTP('nonexistent@example.com');
    console.log('Risultato:', result);
    if (!result.success) {
      console.log('✅ OTP correttamente NON inviato a email inesistente');
    } else {
      console.log('❌ ERRORE: OTP inviato a email inesistente!');
    }
  } catch (error) {
    console.log('❌ Errore nel test:', error.message);
  }
  console.log('');

  // Test 3: Verifica struttura database
  console.log('🗄️ Test 3: Verifica struttura database');
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('email')
      .limit(5);

    if (error) {
      console.log('❌ Errore nel recupero profili:', error.message);
    } else {
      console.log('✅ Profili nel database:', profiles.length);
      console.log('Prime 5 email:', profiles.map(p => p.email));
    }
  } catch (error) {
    console.log('❌ Errore nella verifica database:', error.message);
  }
  console.log('');

  console.log('🏁 Test completato!');
}

// Esegui il test
testOTPSecurity().catch(console.error);
