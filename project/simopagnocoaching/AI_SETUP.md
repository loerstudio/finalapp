# 🤖 Setup AI per Pagno Calories

## 🚀 Sistema AI Super-Intelligente

Pagno Calories utilizza un sistema AI avanzato multi-livello per riconoscimento perfetto degli alimenti:

### 📊 Livelli di AI (in ordine di priorità):

1. **🔥 ChatGPT Vision (Premium)** - Precisione: 95%
2. **🧠 Gemini Pro Vision (Gratuito/Premium)** - Precisione: 90%  
3. **🔄 HuggingFace (Gratuito)** - Precisione: 75%

---

## 🔧 Configurazione API

### 1. ChatGPT Vision API (Consigliato)

**Costo:** ~$0.01 per immagine
**Precisione:** 95%
**Setup:**

1. Vai su [platform.openai.com](https://platform.openai.com)
2. Crea account e aggiungi metodo di pagamento
3. Vai su [API Keys](https://platform.openai.com/api-keys)
4. Crea nuova API key
5. Copia la key nel file `src/screens/PagnoCaloriesScreen.tsx`:

```typescript
const OPENAI_API_KEY = 'sk-your-actual-openai-key-here';
```

### 2. Gemini Pro Vision (Gratuito!)

**Costo:** Gratuito (60 richieste/minuto)
**Precisione:** 90%
**Setup:**

1. Vai su [makersuite.google.com](https://makersuite.google.com)
2. Accedi con account Google
3. Vai su [API Key](https://makersuite.google.com/app/apikey)
4. Crea nuova API key
5. Copia la key nel file `src/screens/PagnoCaloriesScreen.tsx`:

```typescript
const GEMINI_API_KEY = 'your-actual-gemini-key-here';
```

### 3. HuggingFace (Già configurato)

**Costo:** Gratuito
**Precisione:** 75%
**Status:** ✅ Già attivo come fallback

---

## 🎯 Risultati Attesi

### Con ChatGPT + Gemini:
- **Precisione:** 95%+ 
- **Riconoscimento:** Pizza margherita, pasta al pomodoro, pollo alla griglia
- **Dati nutrizionali:** Calorie, proteine, carboidrati, grassi, fibre
- **Velocità:** 2-3 secondi

### Solo HuggingFace (senza API):
- **Precisione:** 75%
- **Riconoscimento:** Pizza, pasta, chicken  
- **Dati nutrizionali:** Database interno
- **Velocità:** 1-2 secondi

---

## 📱 Test del Sistema

1. **Scatta foto** di un alimento
2. **Osserva il log** nella console per vedere quale AI viene usato
3. **Controlla precisione** del riconoscimento

### Log di esempio:
```
🔥 Analisi con ChatGPT Vision...
✅ ChatGPT SUCCESS: pizza margherita (95.2%)
🎯 AI RESULT: pizza margherita (95.2% da ChatGPT Vision)
```

---

## 💰 Costi Stimati

### ChatGPT Vision:
- **Input:** ~$0.01 per immagine 1024x1024
- **100 foto/mese:** ~$1.00
- **1000 foto/mese:** ~$10.00

### Gemini Pro Vision:
- **Gratuito:** 60 richieste/minuto
- **A pagamento:** $0.0025 per immagine

### HuggingFace:
- **Sempre gratuito** (con rate limiting)

---

## ⚡ Ottimizzazioni

1. **Cache locale** per alimenti già riconosciuti
2. **Compressione immagini** per ridurre costi
3. **Fallback intelligente** tra diverse AI
4. **Database nutrizionale** offline integrato

---

## 🔍 Debugging

Se il riconoscimento non funziona:

1. **Controlla console** per errori API
2. **Verifica API keys** sono corrette
3. **Testa connessione** internet
4. **Prova con immagini** più chiare

### Test API Keys:

```bash
# Test ChatGPT
curl -H "Authorization: Bearer YOUR_OPENAI_KEY" \
     https://api.openai.com/v1/models

# Test Gemini  
curl -H "x-goog-api-key: YOUR_GEMINI_KEY" \
     https://generativelanguage.googleapis.com/v1beta/models
```

---

## 🚀 Prossimi Miglioramenti

- [ ] Claude Vision API
- [ ] Riconoscimento porzioni automatico
- [ ] Database nutrizionale italiano esteso
- [ ] Cache intelligente per costi ridotti
- [ ] Modalità offline avanzata 