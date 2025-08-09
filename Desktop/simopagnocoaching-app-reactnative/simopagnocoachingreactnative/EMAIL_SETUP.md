# 📧 Configurazione Email per SimoPagno Coaching

## 🔧 Setup SendGrid (Raccomandato)

### 1. Crea Account SendGrid
1. Vai su [SendGrid](https://sendgrid.com/)
2. Crea un account gratuito (100 email/giorno)
3. Verifica la tua email

### 2. Genera API Key
1. Vai su "Settings" → "API Keys"
2. Clicca "Create API Key"
3. Scegli "Restricted Access" → "Mail Send"
4. **Copia l'API Key** generata

### 3. Verifica Email Mittente
1. Vai su "Settings" → "Sender Authentication"
2. Verifica il tuo dominio o email
3. Usa l'email verificata come mittente

### 4. Configura l'App
1. Apri `config/email.js`
2. Sostituisci le credenziali:

```javascript
export const emailConfig = {
  sendgrid: {
    apiKey: 'SG.your-api-key-here',
    fromEmail: 'noreply@tuodominio.com'
  }
};
```

## 🔧 Setup Gmail (Alternativo)

### 1. Abilita Verifica in Due Passaggi
1. Vai su [Google Account](https://myaccount.google.com/)
2. Clicca su "Sicurezza"
3. Abilita "Verifica in due passaggi" se non è già attiva

### 2. Genera Password per App
1. Nella sezione "Sicurezza", cerca "Password per le app"
2. Clicca su "Password per le app"
3. Seleziona "App" e scegli "Altro (nome personalizzato)"
4. Inserisci "SimoPagno Coaching"
5. Clicca "Genera"
6. **Copia la password di 16 caratteri** (es: `abcd efgh ijkl mnop`)

### 3. Configura l'App
1. Apri `config/email.js`
2. Sostituisci `your-app-password-here` con la password generata
3. Assicurati che l'email sia corretta

```javascript
export const emailConfig = {
  service: 'gmail',
  auth: {
    user: 'tua-email@gmail.com',
    pass: 'abcd efgh ijkl mnop' // Password app generata
  }
};
```

## 🚀 Test dell'Invio Email

1. Avvia l'app: `npm start`
2. Inserisci l'email: `itsilorenz07@gmail.com`
3. Clicca "Invia OTP"
4. Controlla la casella email
5. Inserisci il codice OTP nell'app

## 📧 Template Email

L'email OTP include:
- ✅ Logo e branding SimoPagno Coaching
- ✅ Codice OTP ben visibile
- ✅ Istruzioni di sicurezza
- ✅ Design responsive
- ✅ Versione testo per client email semplici

## 🔒 Sicurezza

- ✅ OTP valido per 10 minuti
- ✅ Massimo 3 tentativi
- ✅ Password app sicura (non password normale)
- ✅ Email crittografata

## 🆘 Risoluzione Problemi

### Email non ricevuta
1. Controlla la cartella spam
2. Verifica che l'email sia corretta
3. Controlla i log dell'app per errori

### Errore di autenticazione
1. Verifica che la password app sia corretta
2. Assicurati che la verifica in due passaggi sia attiva
3. Rigenera la password app se necessario

### Provider alternativi
Se non usi Gmail, modifica `config/email.js` con le credenziali del tuo provider.
