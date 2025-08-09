// Configurazione SimoPagno Coaching App
// IMPORTANTE: Sostituisci con le tue credenziali reali da Supabase

export const config = {
  // Supabase Configuration
  supabase: {
    // Sostituisci con il tuo Project URL da Supabase Dashboard → Settings → API
    url: 'https://mlltbyzjeoakfculpvrg.supabase.co',
    // Sostituisci con la tua anon public key da Supabase Dashboard → Settings → API
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sbHRieXpqZW9ha2ZjdWxwdnJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NDM1NjcsImV4cCI6MjA3MDIxOTU2N30.68LaOotdfgCSZsLsjekRMJDJO1TlQeynzE4TTryXoU4',
  },
  
  // AI Configuration (Gemini)
  gemini: {
    apiKey: 'your-gemini-api-key-here',
  },
  
  // App Configuration
  app: {
    name: 'SimoPagno Coaching',
    version: '1.0.0',
  },
};
