# 🧪 Checklist Test Completa - SimoPagno Coaching

## ✅ Test Autenticazione

### Test Login con Password
- [ ] Apri l'app
- [ ] Vai alla schermata di login
- [ ] Inserisci email: `itsilorenz07@gmail.com`
- [ ] Inserisci password: `LorenzoCoach123`
- [ ] Clicca "Accedi"
- [ ] **Risultato**: Dovresti accedere alla dashboard

### Test Login con OTP
- [ ] Vai alla schermata di login
- [ ] Inserisci email: `itsilorenz07@gmail.com`
- [ ] Clicca "Invia OTP"
- [ ] Controlla la casella email
- [ ] Copia il codice OTP dall'email
- [ ] Inserisci il codice OTP
- [ ] Clicca "Verifica OTP"
- [ ] **Risultato**: Dovresti accedere alla dashboard

## ✅ Test Chat

### Test Creazione Conversazione
- [ ] Vai alla tab "Chat"
- [ ] Clicca il pulsante "+" per nuova conversazione
- [ ] Seleziona un coach dalla lista
- [ ] **Risultato**: Dovrebbe creare una nuova chat

### Test Invio Messaggi
- [ ] Apri una conversazione esistente
- [ ] Scrivi un messaggio
- [ ] Clicca "Invia"
- [ ] **Risultato**: Il messaggio dovrebbe apparire nella chat

### Test Lista Conversazioni
- [ ] Vai alla tab "Chat"
- [ ] **Risultato**: Dovresti vedere la lista delle conversazioni

## ✅ Test Database

### Test Persistenza Dati
- [ ] Crea una conversazione
- [ ] Invia alcuni messaggi
- [ ] Chiudi l'app completamente
- [ ] Riapri l'app
- [ ] **Risultato**: I dati dovrebbero essere ancora presenti

### Test Sincronizzazione
- [ ] Invia un messaggio
- [ ] Controlla Supabase Dashboard → Table Editor
- [ ] **Risultato**: Il messaggio dovrebbe apparire nella tabella `messages`

## ✅ Test Funzionalità Core

### Test Dashboard
- [ ] Accedi all'app
- [ ] Vai alla tab "Dashboard"
- [ ] **Risultato**: Dovresti vedere i 4 riquadri principali

### Test Allenamenti
- [ ] Vai alla tab "Allenamenti"
- [ ] **Risultato**: Dovresti vedere la lista degli allenamenti

### Test Alimentazione
- [ ] Vai alla tab "Alimentazione"
- [ ] **Risultato**: Dovresti vedere il piano alimentare

### Test Progressi
- [ ] Vai alla tab "Progressi"
- [ ] **Risultato**: Dovresti vedere i grafici e le statistiche

## 🔧 Troubleshooting

### Problema: Login non funziona
1. **Verifica credenziali Supabase**
   - Controlla `config.js` - URL e anonKey corretti
   - Verifica che le tabelle siano create in Supabase

2. **Verifica utente demo**
   - Controlla che l'utente `itsilorenz07@gmail.com` esista
   - Verifica nella tabella `profiles` in Supabase

### Problema: OTP non ricevuto
1. **Controlla configurazione email**
   - Verifica Authentication → Settings → Email Auth
   - Controlla il template Magic Link
   - Verifica spam/junk folder

2. **Testa con email diversa**
   - Prova con Gmail o Outlook
   - Verifica che l'email sia valida

### Problema: Chat non funziona
1. **Verifica tabelle database**
   - Controlla che `chats` e `messages` esistano
   - Verifica le policy RLS

2. **Controlla log**
   - Apri DevTools nel browser
   - Controlla i log di errore

## 🎯 Risultato Finale

Se tutti i test passano:
- ✅ **Backend Supabase** completamente funzionante
- ✅ **Autenticazione** con email/password e OTP
- ✅ **Chat in tempo reale** con database
- ✅ **Persistenza dati** garantita
- ✅ **Sincronizzazione** automatica
- ✅ **App pronta** per la produzione

## 🚀 Prossimi Passi

1. **Implementare real-time** per le chat
2. **Aggiungere notifiche push**
3. **Implementare upload file** per media
4. **Aggiungere analytics** e monitoring
5. **Ottimizzare performance**
6. **Testare su dispositivi reali**
