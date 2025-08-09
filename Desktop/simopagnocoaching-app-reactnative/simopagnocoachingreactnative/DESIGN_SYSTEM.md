# Design System - SimoPagno Coaching App

## 🎨 Palette Colori

### Colori Principali
- **Primary (Giallo)**: `#FFD700` - Per azioni principali, bottoni, elementi interattivi
- **Accent (Verde Lime)**: `#00FF7F` - Per accenti, successi, elementi secondari
- **Background**: `#0A0A0A` - Sfondo principale molto scuro
- **Surface**: `#1A1A1A` - Sfondo per card e contenitori
- **Card**: `#2A2A2A` - Sfondo per elementi di livello superiore

### Colori Testo
- **Text Primary**: `#FFFFFF` - Testo principale bianco
- **Text Secondary**: `#B0B0B0` - Testo secondario grigio chiaro
- **Text Muted**: `#808080` - Testo attenuato grigio medio

### Colori Stato
- **Success**: `#00FF7F` - Verde lime per successi
- **Error**: `#FF6B6B` - Rosso per errori
- **Warning**: `#FFA500` - Arancione per avvisi
- **Info**: `#4ECDC4` - Turchese per informazioni

## 🧩 Componenti UI

### Button Component
```tsx
import Button from '@/components/ui/Button';

// Bottoni primari (gialli)
<Button
  title="Invia OTP"
  onPress={handleSendOTP}
  loading={loading}
  icon="arrow-forward"
  iconPosition="right"
  size="large"
/>

// Bottoni secondari (outline giallo)
<Button
  title="Torna indietro"
  onPress={handleBack}
  variant="secondary"
  icon="arrow-back"
  iconPosition="left"
  size="medium"
/>

// Bottoni outline (grigi)
<Button
  title="Annulla"
  onPress={handleCancel}
  variant="outline"
  size="small"
/>
```

**Varianti disponibili:**
- `primary`: Giallo con testo nero
- `secondary`: Trasparente con bordo giallo
- `outline`: Grigio con bordo sottile

**Dimensioni disponibili:**
- `small`: 12px padding verticale
- `medium`: 16px padding verticale (default)
- `large`: 20px padding verticale

### Input Component
```tsx
import Input from '@/components/ui/Input';

<Input
  label="Email"
  icon="mail"
  placeholder="Inserisci la tua email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  autoCapitalize="none"
  autoCorrect={false}
/>
```

**Proprietà:**
- `label`: Etichetta sopra l'input
- `icon`: Icona Ionicons da mostrare a sinistra
- `error`: Messaggio di errore da mostrare sotto
- `containerStyle`: Stile personalizzato per il container
- `labelStyle`: Stile personalizzato per l'etichetta
- `inputStyle`: Stile personalizzato per l'input

## 📱 Utilizzo nei File

### Import dei Colori
```tsx
import { Colors } from '@/constants/Colors';

// Utilizzo
backgroundColor: Colors.fitness.background
color: Colors.fitness.primary
borderColor: Colors.fitness.card
```

### Import dei Componenti
```tsx
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
```

## 🔒 Sistema OTP

### Funzionalità Mantenute
- ✅ **Verifica Email nel Database**: L'OTP viene inviato SOLO alle email esistenti nella tabella `profiles`
- ✅ **Integrazione Supabase**: Sistema di autenticazione completo e sicuro
- ✅ **Gestione Errori**: Validazione e messaggi di errore chiari
- ✅ **Loading States**: Indicatori di caricamento durante le operazioni
- ✅ **Sicurezza Rafforzata**: `shouldCreateUser: false` per prevenire creazione automatica utenti

### Sicurezza OTP
Il sistema ora implementa un doppio controllo di sicurezza:

1. **Verifica Database**: Prima di inviare l'OTP, verifica che l'email esista nella tabella `profiles`
2. **Supabase Config**: `shouldCreateUser: false` impedisce la creazione automatica di utenti non registrati
3. **Messaggi Chiari**: L'utente riceve messaggi specifici se l'email non è registrata

### Flusso di Sicurezza
```
1. Utente inserisce email → 2. Verifica esistenza nel database → 3. Se esiste: invia OTP | Se non esiste: errore
```

### Design Aggiornato
- 🎨 **Tema Scuro**: Sfondo nero con accenti gialli/verdi
- 🎯 **Bottoni Moderni**: Design arrotondato con ombre e icone
- 📱 **Responsive**: Adattamento a diverse dimensioni schermo
- 🎭 **Consistenza**: Stile uniforme in tutta l'app
- 🔒 **Sicurezza**: OTP inviato solo a utenti registrati

## 🚀 Implementazione

### 1. Aggiornamento Colori
I colori sono definiti in `constants/Colors.ts` e includono sia il tema originale che il nuovo tema fitness.

### 2. Componenti Riutilizzabili
- `Button.tsx`: Bottoni con varianti e dimensioni
- `Input.tsx`: Campi input con icone e gestione errori

### 3. Schermate Aggiornate
- `login.tsx`: Schermata di login con nuovo design
- `register.tsx`: Schermata di registrazione con colori aggiornati

## 📋 Checklist Implementazione

- [x] Aggiornamento palette colori
- [x] Creazione componenti Button e Input
- [x] Aggiornamento schermata login
- [x] Aggiornamento schermata registrazione
- [x] Documentazione design system
- [x] Mantenimento logica OTP esistente

## 🎯 Prossimi Passi

1. **Applicare il design system** alle altre schermate dell'app
2. **Creare componenti aggiuntivi** per card, modali, etc.
3. **Implementare animazioni** per transizioni fluide
4. **Testare su diversi dispositivi** per verificare la responsività

## 🔧 Personalizzazione

Per personalizzare il design system:

1. **Modifica colori** in `constants/Colors.ts`
2. **Aggiorna componenti** in `components/ui/`
3. **Applica stili** nelle schermate esistenti
4. **Mantieni la coerenza** in tutta l'applicazione

---

**Nota**: Questo design system mantiene tutte le funzionalità esistenti dell'app, inclusa la logica OTP che verifica le email nel database prima di inviare i codici.
