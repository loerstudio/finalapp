// 🔧 Configurazione per lo script di creazione utenti
// IMPORTANTE: Sostituisci con le tue credenziali reali da Supabase

module.exports = {
  // Supabase Configuration
  supabase: {
    // Il tuo Project URL da Supabase Dashboard → Settings → API
    url: 'https://mlltbyzjeoakfculpvrg.supabase.co',
    
    // IMPORTANTE: Usa la SERVICE ROLE KEY, non la anon key!
    // Vai su Supabase Dashboard → Settings → API → service_role
    serviceRoleKey: 'YOUR_SERVICE_ROLE_KEY_HERE',
  },
  
  // Dati utenti da creare
  users: {
    coach: {
      email: 'coach@simopagnocoaching.com',
      password: 'Coach2024!',
      name: 'Simo Pagno',
      role: 'coach'
    },
    client: {
      email: 'cliente@simopagnocoaching.com',
      password: 'Cliente2024!',
      name: 'Mario Rossi',
      role: 'client'
    }
  },
  
  // Messaggio di benvenuto
  welcomeMessage: 'Ciao! Benvenuto in SimoPagno Coaching! Sono qui per aiutarti a raggiungere i tuoi obiettivi fitness. 🏋️‍♂️'
};
