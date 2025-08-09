// Configurazione Email per SimoPagno Coaching
// IMPORTANTE: Sostituisci con le tue credenziali reali

export const emailConfig = {
  // EmailJS Configuration (Compatibile con React Native)
  emailjs: {
    serviceId: 'your-emailjs-service-id',
    templateId: 'your-emailjs-template-id', 
    userId: 'your-emailjs-user-id'
  },
  
  // Resend Configuration (Alternativa moderna)
  resend: {
    apiKey: 'your-resend-api-key',
    fromEmail: 'noreply@simopagnocoaching.com'
  },
  
  // Configurazione per servizi cloud
  cloudServices: {
    // Firebase Functions (se usi Firebase)
    firebase: {
      functionUrl: 'your-firebase-function-url'
    },
    
    // Vercel Functions (se usi Vercel)
    vercel: {
      functionUrl: 'your-vercel-function-url'
    }
  }
};

// Istruzioni per EmailJS:
/*
1. Vai su https://www.emailjs.com/
2. Crea un account gratuito
3. Configura un servizio email (Gmail, Outlook, etc.)
4. Crea un template email
5. Copia Service ID, Template ID e User ID
6. Inseriscili qui sopra
*/

// Istruzioni per configurare Gmail:
/*
1. Vai su https://myaccount.google.com/
2. Abilita "Verifica in due passaggi" se non è già attiva
3. Vai su "Password per le app"
4. Genera una nuova password per l'app
5. Usa quella password qui sopra (NON la tua password normale)
6. Assicurati che l'email sia verificata
*/
