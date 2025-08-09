# 🚀 STEP 2: Creazione Utenti Coach e Cliente

## 📋 Prerequisiti
- ✅ Database schema creato e eseguito (Step 1 completato)
- ✅ Progetto Supabase configurato
- ✅ Service Role Key di Supabase

## 🔧 Configurazione

### 1. Installa le dipendenze
```bash
cd simopagnocoachingreactnative
npm install @supabase/supabase-js dotenv
```

### 2. Configura le variabili d'ambiente
Crea un file `.env` nella cartella `scripts/` con:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Come ottenere questi valori:**
1. Vai su [Supabase Dashboard](https://supabase.com/dashboard)
2. Seleziona il tuo progetto
3. Vai su **Settings** > **API**
4. Copia **Project URL** e **service_role key**

## 🎯 Opzioni per la creazione utenti

### Opzione A: Utenti predefiniti (automatico)
```bash
cd scripts
node create-first-users.js
```

**Crea automaticamente:**
- 👨‍💼 Coach: coach@simopagnocoaching.com / Coach123!
- 👤 Cliente: client@simopagnocoaching.com / Client123!

### Opzione B: Utenti personalizzati (interattivo) ⭐ RACCOMANDATO
```bash
cd scripts
node create-custom-users.js
```

**Ti permette di inserire:**
- 📧 Email reali per coach e cliente
- 🔑 Password personalizzate
- 👤 Nomi reali
- ✅ Conferma prima della creazione

## 👥 Cosa viene creato

1. ✅ Utente Coach in auth.users
2. ✅ Profilo Coach in profiles
3. ✅ Utente Cliente in auth.users
4. ✅ Profilo Cliente in profiles
5. ✅ Chat tra coach e cliente
6. ✅ Messaggio di benvenuto personalizzato

## 🔍 Verifica

Dopo l'esecuzione, puoi verificare su Supabase:

1. **Authentication** > **Users** - dovresti vedere 2 utenti
2. **Table Editor** > **profiles** - dovresti vedere 2 profili
3. **Table Editor** > **chats** - dovresti vedere 1 chat
4. **Table Editor** > **messages** - dovresti vedere 1 messaggio

## 🚨 Risoluzione Problemi

### Errore "Variabili d'ambiente mancanti"
- Verifica che il file `.env` sia nella cartella `scripts/`
- Controlla che SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY siano corretti

### Errore "permission denied"
- Verifica che la service_role key sia corretta
- Assicurati che RLS sia abilitato ma le policy permettano l'inserimento

### Errore "duplicate key value"
- Gli utenti esistono già, puoi saltare questo step o eliminare prima gli utenti esistenti

## 🔄 Prossimo Step
Dopo aver completato questo step, procedi con:
- **Step 3:** Test delle funzionalità di base
- **Step 4:** Configurazione dell'app React Native
