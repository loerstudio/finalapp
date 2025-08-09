# 🔐 Sistema di Gestione Utenti - SimoPagno Coaching

## 📋 Panoramica

Il sistema è stato aggiornato per implementare un controllo rigoroso sulla gestione degli utenti. **Solo i coach autorizzati possono creare, modificare, eliminare e gestire account utente**.

## 🚫 Registrazione Pubblica Disabilitata

- ❌ **Non è più possibile** registrarsi pubblicamente dall'app
- ❌ **Non è più possibile** creare account senza autorizzazione
- ✅ **Solo i coach autorizzati** possono creare nuovi utenti

## 👑 Coach Autorizzati

### Accesso alla Gestione Utenti
- **Email autorizzata**: `loerstudio0@gmail.com`
- **Ruolo richiesto**: `coach`
- **Account deve essere**: `attivo`

### Permessi del Coach
- ✅ Visualizzare tutti gli utenti
- ✅ Creare nuovi utenti (coach e clienti)
- ✅ Modificare profili esistenti
- ✅ Attivare/disattivare account
- ✅ Eliminare utenti definitivamente

## 👥 Utenti Predefiniti

### Coach Principale
- **Email**: `loerstudio0@gmail.com`
- **Nome**: Simo Pagno
- **Ruolo**: `coach`
- **Stato**: `attivo`

### Cliente Principale
- **Email**: `itsilorenz07@gmail.com`
- **Nome**: Lorenzo
- **Ruolo**: `client`
- **Stato**: `attivo`

## 🔧 Configurazione Database

### 1. Esegui lo Script di Inizializzazione
```sql
-- Esegui nel SQL Editor di Supabase
-- File: scripts/init-specific-users.sql
```

### 2. Verifica la Struttura
La tabella `profiles` deve includere:
- `id` (UUID, Primary Key)
- `email` (TEXT, Unique)
- `name` (TEXT)
- `role` (TEXT: 'coach' o 'client')
- `is_active` (BOOLEAN, Default: true)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 3. Policy RLS Attive
- **Users can view own profile**: Solo profilo proprio e attivo
- **Users can update own profile**: Solo profilo proprio e attivo
- **Users can insert own profile**: Inserimento profilo proprio
- **Authorized coaches can manage all users**: Gestione completa per coach autorizzati

## 📱 Utilizzo dell'App

### Per i Coach Autorizzati
1. **Accedi** con `loerstudio0@gmail.com`
2. **Naviga** alla sezione "Gestione Utenti"
3. **Gestisci** tutti gli utenti del sistema

### Per i Clienti
1. **Accedi** con le credenziali fornite dal coach
2. **Non possono** accedere alla gestione utenti
3. **Non possono** creare nuovi account

## 🛡️ Sicurezza

### Controlli Implementati
- ✅ Verifica ruolo utente corrente
- ✅ Verifica email autorizzata (`loerstudio0@gmail.com`)
- ✅ Verifica stato account attivo
- ✅ Row Level Security (RLS) attivo
- ✅ Policy permissive solo per coach autorizzati

### Protezioni
- 🔒 Accesso alla gestione utenti solo per coach autorizzati
- 🔒 Creazione utenti solo tramite coach autorizzati
- 🔒 Modifica profili solo per utenti autorizzati
- 🔒 Eliminazione utenti solo per coach autorizzati

## 📁 File del Sistema

### Servizi
- `lib/userManagementService.ts` - Gestione completa utenti
- `lib/otpService.ts` - Sistema OTP per login (non registrazione)

### Pagine
- `app/user-management.tsx` - Interfaccia gestione utenti
- `app/login.tsx` - Login (registrazione rimossa)

### Script Database
- `scripts/init-specific-users.sql` - Inizializzazione utenti
- `scripts/update-profiles-table.sql` - Aggiornamento struttura

## 🚀 Setup Iniziale

### 1. Database
```bash
# Esegui nel SQL Editor di Supabase
scripts/init-specific-users.sql
```

### 2. Verifica
- Controlla che gli utenti siano stati creati
- Verifica che le policy RLS siano attive
- Testa l'accesso con `loerstudio0@gmail.com`

### 3. Test
- Accedi come coach autorizzato
- Crea un nuovo utente cliente
- Verifica che il cliente possa accedere
- Testa la disattivazione/riattivazione

## ⚠️ Note Importanti

### Per i Coach
- **Mantieni sicure** le credenziali di accesso
- **Verifica sempre** i dati prima di creare utenti
- **Gestisci con attenzione** l'eliminazione di account

### Per i Clienti
- **Non possono** creare account autonomamente
- **Devono** contattare il coach per registrazione
- **Non hanno accesso** alla gestione utenti

### Per gli Sviluppatori
- **Non modificare** le policy RLS senza attenzione
- **Testa sempre** le modifiche in ambiente di sviluppo
- **Mantieni aggiornata** la documentazione

## 🔍 Troubleshooting

### Problemi Comuni
1. **Coach non può accedere alla gestione utenti**
   - Verifica che l'email sia `loerstudio0@gmail.com`
   - Verifica che il ruolo sia `coach`
   - Verifica che l'account sia `attivo`

2. **Errori di autorizzazione**
   - Controlla le policy RLS
   - Verifica lo stato dell'utente corrente
   - Controlla i log di Supabase

3. **Utenti non visibili**
   - Verifica che `is_active = true`
   - Controlla le policy di SELECT
   - Verifica i permessi dell'utente corrente

## 📞 Supporto

Per problemi o domande:
- Contatta il team di sviluppo
- Verifica i log di Supabase
- Controlla la documentazione RLS
- Testa in ambiente di sviluppo
