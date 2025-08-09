# 📧 Configurazione Email OTP in Supabase

## 🔧 Step 1: Configura Authentication Settings

### 1. Vai su Authentication → Settings
1. Nel menu laterale, clicca **Authentication**
2. Clicca **Settings**
3. Nella sezione **Email Auth**, abilita:
   - ✅ **Enable email confirmations**
   - ✅ **Enable email change confirmations**
   - ✅ **Enable secure email change**

### 2. Configura Site URL
Nella sezione **Site URL**:
```
URL: https://your-project.supabase.co
Redirect URLs: simopagnocoaching://login
```

## 📧 Step 2: Configura Email Templates

### 1. Vai su Authentication → Email Templates
1. Nel menu laterale, clicca **Authentication**
2. Clicca **Email Templates**
3. Seleziona **Magic Link**

### 2. Personalizza il Template Magic Link
Sostituisci il contenuto con:

```html
<h2>🔐 Codice OTP - SimoPagno Coaching</h2>
<p>Ciao!</p>
<p>Hai richiesto l'accesso alla tua area personale di SimoPagno Coaching.</p>
<p>Il tuo codice OTP è: <strong>{{ .Token }}</strong></p>
<p>Valido per 10 minuti.</p>
<p>Inserisci questo codice nell'app per accedere al tuo account.</p>
<p>Grazie per aver scelto SimoPagno Coaching! 💪</p>
<p>SimoPagno Coaching</p>
```

### 3. Personalizza il Template Confirm Signup
```html
<h2>🎉 Benvenuto in SimoPagno Coaching!</h2>
<p>Ciao {{ .Email }}!</p>
<p>Il tuo account è stato creato con successo.</p>
<p>Puoi ora accedere alla tua area personale usando la tua email e password.</p>
<p>SimoPagno Coaching</p>
```

## 🔗 Step 3: Configura Redirect URLs

### 1. Vai su Authentication → URL Configuration
1. Nel menu laterale, clicca **Authentication**
2. Clicca **URL Configuration**
3. Aggiungi questi URL:

```
Site URL: https://your-project.supabase.co
Redirect URLs:
- simopagnocoaching://login
- exp://localhost:8081
- exp://192.168.1.100:8081
```

## 🎯 Step 4: Test Email OTP

### 1. Testa l'Invio OTP
1. Avvia l'app: `npm start`
2. Vai alla schermata di login
3. Inserisci la tua email
4. Clicca "Invia OTP"
5. Controlla la casella email

### 2. Verifica Email Ricevuta
L'email dovrebbe contenere:
- Oggetto: "Your login link for [Project Name]"
- Corpo: Il codice OTP personalizzato

## 🔧 Troubleshooting

### Problema: Email non ricevute
1. **Controlla spam**: Cerca nelle cartelle spam/junk
2. **Verifica configurazione**: Controlla Authentication → Settings
3. **Testa con email diversa**: Prova con Gmail o Outlook

### Problema: OTP non valido
1. **Verifica template**: Controlla il template Magic Link
2. **Controlla token**: Assicurati che `{{ .Token }}` sia presente
3. **Testa manualmente**: Prova a inviare un nuovo OTP

### Problema: Redirect non funziona
1. **Verifica URL**: Controlla i Redirect URLs
2. **Testa localhost**: Aggiungi `exp://localhost:8081`
3. **Controlla app**: Verifica che l'app gestisca il redirect

## 📱 Configurazione App

### 1. Aggiorna app.json
```json
{
  "expo": {
    "scheme": "simopagnocoaching",
    "plugins": [
      [
        "expo-secure-store",
        {
          "faceIDPermission": "Allow SimoPagno Coaching to access your Face ID."
        }
      ]
    ]
  }
}
```

### 2. Testa Deep Linking
```bash
# Testa il deep link
npx uri-scheme open simopagnocoaching://login --ios
npx uri-scheme open simopagnocoaching://login --android
```

## ✅ Checklist Completa

- [ ] Authentication Settings configurati
- [ ] Email Templates personalizzati
- [ ] Redirect URLs aggiunti
- [ ] Site URL configurato
- [ ] Test email OTP funzionante
- [ ] Deep linking configurato
- [ ] App gestisce redirect correttamente

## 🎯 Risultato Finale

Dopo questa configurazione:
- ✅ **Email OTP** inviate automaticamente
- ✅ **Template personalizzati** con branding
- ✅ **Deep linking** funzionante
- ✅ **Redirect automatico** nell'app
- ✅ **Sicurezza** garantita da Supabase
