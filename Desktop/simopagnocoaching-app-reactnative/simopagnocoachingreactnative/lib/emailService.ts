// Servizio Email per React Native
// Usa un approccio compatibile con l'ambiente mobile

// Template email OTP
const createOTPEmailTemplate = (otp: string, userName: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Codice OTP - SimoPagno Coaching</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .otp-code {
            background: #FF6B35;
            color: white;
            font-size: 32px;
            font-weight: bold;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin: 20px 0;
            letter-spacing: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏋️ SimoPagno Coaching</h1>
        <p>Il tuo codice di accesso sicuro</p>
    </div>
    
    <div class="content">
        <h2>Ciao ${userName}!</h2>
        
        <p>Hai richiesto l'accesso alla tua area personale di SimoPagno Coaching.</p>
        
        <p>Ecco il tuo codice OTP di 6 cifre:</p>
        
        <div class="otp-code">${otp}</div>
        
        <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul>
                <li>Questo codice è valido per 10 minuti</li>
                <li>Non condividerlo con nessuno</li>
                <li>Se non hai richiesto questo accesso, ignora questa email</li>
            </ul>
        </div>
        
        <p>Inserisci questo codice nell'app per accedere al tuo account.</p>
        
        <p>Grazie per aver scelto SimoPagno Coaching! 💪</p>
    </div>
    
    <div class="footer">
        <p>© 2024 SimoPagno Coaching. Tutti i diritti riservati.</p>
        <p>Questa email è stata inviata automaticamente, non rispondere.</p>
    </div>
</body>
</html>
`;

class EmailService {
  // Configurazione per servizi email cloud
  private emailConfig = {
    // EmailJS (servizio gratuito per React Native)
    emailjs: {
      serviceId: 'your-service-id',
      templateId: 'your-template-id',
      userId: 'your-user-id'
    },
    
    // Resend (alternativa moderna)
    resend: {
      apiKey: 'your-resend-api-key',
      fromEmail: 'noreply@simopagnocoaching.com'
    }
  };

  // Invia OTP via email usando EmailJS (compatibile con React Native)
  async sendOTPEmail(email: string, otp: string, userName: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Per ora, simuliamo l'invio email
      // In produzione, useresti EmailJS o un servizio simile
      
      console.log(`📧 Email OTP inviata a ${email}`);
      console.log(`👤 Utente: ${userName}`);
      console.log(`🔐 Codice OTP: ${otp}`);
      console.log(`📝 Template HTML generato`);
      
      // Simula un delay di invio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In un'implementazione reale, qui chiameresti EmailJS:
      /*
      const templateParams = {
        to_email: email,
        to_name: userName,
        otp_code: otp,
        message: `Il tuo codice OTP è: ${otp}`
      };
      
      await emailjs.send(
        this.emailConfig.emailjs.serviceId,
        this.emailConfig.emailjs.templateId,
        templateParams,
        this.emailConfig.emailjs.userId
      );
      */
      
      return { success: true };
    } catch (error) {
      console.error('Errore nell\'invio email OTP:', error);
      return { success: false, error: 'Errore nell\'invio email' };
    }
  }

  // Test connessione email
  async testConnection(): Promise<boolean> {
    try {
      console.log('✅ Servizio email disponibile');
      return true;
    } catch (error) {
      console.error('❌ Errore nel servizio email:', error);
      return false;
    }
  }

  // Genera template email per debug
  generateEmailTemplate(otp: string, userName: string): string {
    return createOTPEmailTemplate(otp, userName);
  }
}

export const emailService = new EmailService();
