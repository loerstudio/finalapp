# SimoPagno Coaching App

Un'applicazione React Native completa per il coaching fitness con funzionalità di gestione clienti, allenamenti, alimentazione e chat.

## 🚀 Caratteristiche

### Autenticazione
- Login con email e password
- Gestione sessioni con Supabase
- Logout sicuro

### Dashboard
- 4 riquadri principali: Allenamento, Alimentazione, Progressi, Chat
- Statistiche rapide
- Design minimalista e intuitivo

### Allenamenti
- Lista esercizi con serie e ripetizioni
- Checkbox grandi per completamento
- Bottone "INIZIA ALLENAMENTO" rosso gigante
- Progress bar in tempo reale
- Timer e gestione pause

### Alimentazione
- Piano alimentare giornaliero
- Macronutrienti (calorie, proteine, carboidrati, grassi)
- Checkbox per pasti completati
- Bottone per food scan con AI (Gemini)
- Progresso giornaliero

### Chat
- Stile WhatsApp con colori brand
- Lista conversazioni
- Messaggi con indicatori di lettura
- Upload di immagini/video
- Chat 1-to-1 Coach ↔ Cliente

### Progressi
- Grafico peso filtrabile (giorni, settimane, mesi, anno)
- Obiettivi con progress bar
- Foto prima/dopo con slider confronto
- Misurazioni recenti
- Calendario storico

## 🛠️ Tecnologie Utilizzate

- **Frontend**: React Native con Expo
- **Backend**: Node.js + Supabase
- **Database**: Supabase (PostgreSQL)
- **Autenticazione**: Supabase Auth
- **Storage**: Supabase Storage
- **AI**: Gemini API per food recognition
- **Navigazione**: React Navigation
- **Icone**: Ionicons

## 📱 Installazione

### Prerequisiti
- Node.js (versione 18 o superiore)
- npm o yarn
- Expo CLI
- Account Supabase

### Setup

1. **Clona il repository**
```bash
git clone <repository-url>
cd simopagnocoachingreactnative
```

2. **Installa le dipendenze**
```bash
npm install
```

3. **Configura Supabase**
   - Crea un nuovo progetto su [Supabase](https://supabase.com)
   - Copia l'URL e la chiave anonima
   - Aggiorna il file `lib/supabase.ts` con le tue credenziali:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

4. **Configura il database**
   - Crea le tabelle necessarie in Supabase (vedi sezione Database Schema)
   - Abilita Row Level Security (RLS)

5. **Avvia l'applicazione**
```bash
npm start
```

## 🗄️ Database Schema

### Tabelle Principali

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('coach', 'client')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workouts
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES users(id),
  coach_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('assigned', 'in_progress', 'completed')) DEFAULT 'assigned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  muscle_group TEXT,
  video_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Exercises
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight DECIMAL,
  rest_time INTEGER,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal Plans
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES users(id),
  coach_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  total_calories INTEGER,
  total_protein DECIMAL,
  total_carbs DECIMAL,
  total_fat DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Foods
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  calories_per_100g INTEGER NOT NULL,
  protein_per_100g DECIMAL NOT NULL,
  carbs_per_100g DECIMAL NOT NULL,
  fat_per_100g DECIMAL NOT NULL,
  category TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress
CREATE TABLE progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES users(id),
  weight DECIMAL NOT NULL,
  front_photo_url TEXT,
  back_photo_url TEXT,
  notes TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID REFERENCES users(id),
  client_id UUID REFERENCES users(id),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'image', 'video')) DEFAULT 'text',
  media_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Configurazione RLS (Row Level Security)

Abilita RLS su tutte le tabelle e configura le policy appropriate per la sicurezza.

## 🎨 Design System

### Colori
- **Primario**: #8B0000 (Rosso scuro)
- **Secondario**: #2E8B57 (Verde)
- **Accent**: #4169E1 (Blu)
- **Chat**: #FF6B35 (Arancione)
- **Background**: #f8f9fa (Grigio chiaro)

### Typography
- **Titoli**: 32px, Bold
- **Sottotitoli**: 18px, Regular
- **Testo**: 16px, Regular
- **Caption**: 14px, Regular

## 📱 Funzionalità Future

- [ ] Notifiche push
- [ ] Live workout con timer
- [ ] Integrazione completa con Gemini AI
- [ ] Video tutorial esercizi
- [ ] Export dati progressi
- [ ] Backup automatico
- [ ] Modalità offline

## 🐛 Risoluzione Problemi

### Errori Comuni

1. **Errore di connessione Supabase**
   - Verifica le credenziali in `lib/supabase.ts`
   - Controlla che il progetto sia attivo

2. **Errore di build**
   - Cancella la cache: `expo start -c`
   - Reinstalla node_modules: `rm -rf node_modules && npm install`

3. **Problemi di navigazione**
   - Verifica che tutte le schermate siano create
   - Controlla la configurazione delle tab

## 📄 Licenza

Questo progetto è sotto licenza MIT.

## 👥 Contributi

1. Fork il progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📞 Supporto

Per supporto o domande, contatta il team di sviluppo.

---

**SimoPagno Coaching App** - Trasforma il tuo coaching fitness con la potenza della tecnologia moderna.
