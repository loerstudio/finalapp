# Setup SimoPagno Coaching App

## 🚀 Guida Completa al Setup

### 1. Prerequisiti

Assicurati di avere installato:
- Node.js (versione 18 o superiore)
- npm o yarn
- Expo CLI (`npm install -g @expo/cli`)
- Git

### 2. Setup Supabase

1. **Crea un account Supabase**
   - Vai su [supabase.com](https://supabase.com)
   - Crea un nuovo account o accedi

2. **Crea un nuovo progetto**
   - Clicca su "New Project"
   - Scegli un nome (es. "simopagno-coaching")
   - Scegli una password per il database
   - Seleziona una regione (preferibilmente Europa)
   - Clicca "Create new project"

3. **Ottieni le credenziali**
   - Vai su Settings > API
   - Copia:
     - Project URL
     - anon public key

4. **Configura il database**
   - Vai su SQL Editor
   - Copia e incolla il contenuto di `scripts/init-database.sql`
   - Esegui lo script

### 3. Setup Applicazione

1. **Clona il repository**
```bash
git clone <repository-url>
cd simopagnocoachingreactnative
```

2. **Installa le dipendenze**
```bash
npm install
```

3. **Configura le credenziali**
   - Copia `config.example.js` in `config.js`
   - Inserisci le tue credenziali Supabase:

```javascript
export const config = {
  supabase: {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key-here',
  },
  // ... resto della configurazione
};
```

4. **Avvia l'applicazione**
```bash
npm start
```

### 4. Test dell'Applicazione

1. **Apri Expo Go** sul tuo dispositivo mobile
2. **Scansiona il QR code** che appare nel terminale
3. **Testa le funzionalità**:
   - Login (usa credenziali di test)
   - Navigazione tra le tab
   - Dashboard con i 4 riquadri
   - Allenamenti con checkbox
   - Alimentazione con progresso
   - Chat con messaggi
   - Progressi con grafico

### 5. Configurazione Avanzata

#### Setup Gemini AI (Opzionale)

1. **Ottieni API Key Gemini**
   - Vai su [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Crea una nuova API key

2. **Configura l'API Key**
   - Aggiungi la chiave in `config.js`:

```javascript
gemini: {
  apiKey: 'your-gemini-api-key-here',
},
```

#### Setup Notifiche Push (Opzionale)

1. **Configura Expo Push Notifications**
   - Segui la [documentazione Expo](https://docs.expo.dev/push-notifications/overview/)

### 6. Struttura del Progetto

```
simopagnocoachingreactnative/
├── app/                    # Schermate dell'app
│   ├── (tabs)/            # Tab navigation
│   ├── login.tsx          # Schermata login
│   └── _layout.tsx        # Layout principale
├── components/            # Componenti riutilizzabili
├── contexts/              # Context React
│   └── AuthContext.tsx    # Gestione autenticazione
├── lib/                   # Librerie e configurazioni
│   └── supabase.ts        # Configurazione Supabase
├── types/                 # Definizioni TypeScript
├── scripts/               # Script di setup
│   └── init-database.sql  # Script database
├── config.js              # Configurazione app
└── package.json           # Dipendenze
```

### 7. Funzionalità Implementate

✅ **Autenticazione**
- Login con email/password
- Gestione sessioni
- Logout

✅ **Dashboard**
- 4 riquadri principali
- Statistiche rapide
- Design minimalista

✅ **Allenamenti**
- Lista esercizi
- Checkbox grandi
- Bottone "INIZIA ALLENAMENTO"
- Progress bar

✅ **Alimentazione**
- Piano alimentare
- Macronutrienti
- Checkbox pasti
- Progresso giornaliero

✅ **Chat**
- Stile WhatsApp
- Lista conversazioni
- Messaggi con indicatori
- Upload media

✅ **Progressi**
- Grafico peso
- Obiettivi
- Foto prima/dopo
- Misurazioni

### 8. Prossimi Passi

1. **Connessione Database Reale**
   - Sostituisci i dati mock con chiamate reali a Supabase
   - Implementa la sincronizzazione dati

2. **Autenticazione Reale**
   - Configura Supabase Auth
   - Implementa registrazione utenti
   - Gestisci ruoli coach/client

3. **Funzionalità AI**
   - Integra Gemini per food recognition
   - Implementa analisi foto

4. **Notifiche**
   - Configura notifiche push
   - Implementa reminder allenamenti

### 9. Troubleshooting

#### Problemi Comuni

**Errore di connessione Supabase**
```bash
# Verifica le credenziali in config.js
# Controlla che il progetto sia attivo
```

**Errore di build**
```bash
# Cancella la cache
expo start -c

# Reinstalla dipendenze
rm -rf node_modules && npm install
```

**Problemi di navigazione**
```bash
# Verifica che tutte le schermate esistano
# Controlla la configurazione delle tab
```

### 10. Supporto

Per problemi o domande:
- Controlla la documentazione Supabase
- Verifica i log di Expo
- Contatta il team di sviluppo

---

**🎉 Setup Completato!** L'applicazione è ora pronta per essere utilizzata e personalizzata secondo le tue esigenze.
