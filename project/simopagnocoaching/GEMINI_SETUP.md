# 🤖 Configurazione Google Gemini Pro Vision per Pagno Calories

## 🎯 Panoramica

Pagno Calories ora utilizza **Google Gemini Pro Vision** come sistema AI principale per il riconoscimento alimentare, con OpenAI GPT-4 Vision come fallback e un sistema locale come ultima risorsa.

## 🚀 Vantaggi di Gemini Pro Vision

- **Gratuito**: 15 richieste al minuto, 1500 al giorno
- **Alta precisione**: Modello multimodale avanzato
- **Velocità**: Risposta rapida e affidabile
- **Multilingua**: Eccellente supporto per l'italiano

## 📋 Setup Rapido

### 1. Ottieni la Chiave API Gemini

1. Vai su: https://makersuite.google.com/app/apikey
2. Accedi con il tuo account Google
3. Clicca "Create API Key"
4. Copia la chiave generata

### 2. Configura l'App

Aggiungi la chiave al file `.env`:

```bash
GEMINI_API_KEY=la_tua_chiave_gemini_qui
```

### 3. Riavvia l'App

```bash
npx expo start --clear
```

## 🔧 Configurazione Avanzata

### Limiti e Quota

- **Gratuito**: 15 richieste/minuto, 1500/giorno
- **Pay-as-you-go**: $0.0025 per 1K caratteri di input
- **Enterprise**: Contatta Google per volumi elevati

### Fallback Automatico

Il sistema funziona in cascata:

1. **Gemini Pro Vision** (primario)
2. **OpenAI GPT-4 Vision** (fallback)
3. **Sistema Locale** (ultima risorsa)

## 🎨 UI/UX

### Indicatori di Stato

- 🟢 **Verde**: Gemini attivo
- 🟡 **Giallo**: OpenAI attivo (fallback)
- 🔴 **Rosso**: Solo sistema locale

### Messaggi Informativi

- "Analizzato con Google Gemini Pro Vision"
- "Identificati X alimenti"
- "Confidenza: 95%"

## 🛠️ Risoluzione Problemi

### Errore "API key not configured"

1. Verifica che la chiave sia nel file `.env`
2. Riavvia l'app con `npx expo start --clear`
3. Controlla che non ci siano spazi extra nella chiave

### Errore "Quota exceeded"

1. Il sistema passerà automaticamente a OpenAI
2. Se anche OpenAI non funziona, userà il sistema locale
3. Per aumentare i limiti: https://ai.google.dev/pricing

### Errore "Network error"

1. Verifica la connessione internet
2. Prova a riavviare l'app
3. Il sistema locale funziona offline

## 📊 Confronto Prestazioni

| Provider | Precisione | Velocità | Costo | Limiti |
|----------|------------|----------|-------|--------|
| **Gemini Pro Vision** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Gratuito | 15/min |
| OpenAI GPT-4 Vision | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | $0.01/1K | 3/min |
| Sistema Locale | ⭐⭐ | ⭐⭐⭐⭐⭐ | Gratuito | Nessuno |

## 🔒 Sicurezza

- Le chiavi API sono salvate localmente
- Nessun dato viene inviato a terze parti
- Le immagini vengono processate temporaneamente

## 📞 Supporto

Per problemi con Gemini:
- Documentazione: https://ai.google.dev/docs
- Console: https://makersuite.google.com/
- Community: https://ai.google.dev/community

---

**🎉 Ora hai il sistema AI più avanzato per il riconoscimento alimentare!** 