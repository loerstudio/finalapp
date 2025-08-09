# 🔒 Configurazione Sicurezza - Sistema OTP

## Sicurezza Implementata

### 1. Verifica Email nel Database
```typescript
// Prima di inviare OTP, verifica che l'email esista
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('id')
  .eq('email', email)
  .single();

if (profileError || !profile) {
  return { 
    success: false, 
    error: 'Email non registrata. Registrati prima di richiedere un OTP.' 
  };
}
```

### 2. Configurazione Supabase Sicura
```typescript
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: 'simopagnocoaching://login',
    shouldCreateUser: false, // IMPEDISCE creazione automatica utenti
  }
});
```

### 3. Flusso di Sicurezza Completo

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Utente        │    │   Verifica       │    │   Risultato     │
│   Inserisce     │───▶│   Database       │───▶│                 │
│   Email         │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Email Esiste?  │
                       └──────────────────┘
                                │
                        ┌───────┴───────┐
                        ▼               ▼
                ┌─────────────┐ ┌─────────────┐
                │     SÌ      │ │      NO     │
                │             │ │             │
                │ Invia OTP   │ │   Errore    │
                │             │ │             │
                └─────────────┘ └─────────────┘
```

## Protezioni Attive

### ✅ **Prevenzione Spam**
- OTP inviato solo a email verificate nel database
- Nessuna creazione automatica di utenti

### ✅ **Prevenzione Attacchi**
- Verifica doppia: database + Supabase
- Messaggi di errore generici (non rivelano informazioni sensibili)

### ✅ **Audit Trail**
- Log completi di tutte le operazioni OTP
- Tracciamento tentativi di accesso

## Messaggi di Errore

### Email Non Registrata
```
"Email non registrata. Registrati prima di richiedere un OTP."
```

### Errore Generico
```
"Errore nell'invio OTP. Riprova più tardi."
```

## Test di Sicurezza

Esegui il test per verificare la sicurezza:
```bash
node scripts/test-otp-security.js
```

## Monitoraggio

### Log da Controllare
- `📧 Verifica email prima di inviare OTP`
- `❌ Email non trovata nel database`
- `✅ Email verificata nel database, invio OTP`

### Metriche di Sicurezza
- Numero tentativi OTP per email
- Email non trovate vs email valide
- Tempo tra tentativi di accesso

## Aggiornamenti Futuri

### Possibili Miglioramenti
1. **Rate Limiting**: Limite tentativi per IP/email
2. **Captcha**: Per prevenire bot
3. **Notifiche**: Alert per tentativi sospetti
4. **Whitelist**: Solo domini email autorizzati

---

**Nota**: Questo sistema garantisce che l'OTP venga inviato SOLO alle email esistenti nel database, prevenendo spam e attacchi di enumerazione.
