# 🔄 Sincronizzazione Automatica con GitHub

Questo progetto è configurato per la sincronizzazione automatica con GitHub. Ogni modifica viene salvata automaticamente e sincronizzata con il repository remoto.

## 🚀 Come Funziona

### 1. **Sincronizzazione Manuale**
```bash
# Sincronizzazione con Node.js (raccomandato)
npm run sync

# Sincronizzazione con Bash
npm run sync:bash

# Sincronizzazione diretta
node scripts/auto-sync.js
./scripts/auto-sync.sh
```

### 2. **Monitoraggio Automatico (RACCOMANDATO)**
```bash
# Avvia il monitoraggio automatico
npm run watch
```
Questo comando:
- 👀 Monitora continuamente le modifiche ai file
- 🔄 Sincronizza automaticamente ogni 30 secondi
- 📥 Controlla aggiornamenti esterni da GitHub
- 💾 Salva tutte le modifiche automaticamente

### 3. **Comandi Git Utili**
```bash
# Stato del repository
npm run git:status

# Log delle modifiche
npm run git:log

# Configurazione Git automatica
npm run git:config
```

## 📋 Configurazione Iniziale

### Prima Volta
1. **Configura Git** (solo la prima volta):
   ```bash
   npm run git:config
   ```

2. **Avvia il monitoraggio automatico**:
   ```bash
   npm run watch
   ```

3. **Lascia attivo il terminale** - il monitoraggio continuerà a funzionare

## 🔧 Funzionalità

### ✅ **Salvataggio Automatico**
- Ogni modifica viene rilevata automaticamente
- Commit automatici con timestamp
- Push automatico su GitHub

### ✅ **Sincronizzazione Bidirezionale**
- Modifiche locali → GitHub
- Modifiche esterne → Locale
- Gestione automatica dei conflitti

### ✅ **Monitoraggio Continuo**
- Controllo ogni 10 secondi
- Sincronizzazione ogni 30 secondi
- Notifiche in tempo reale

## 💡 Suggerimenti per l'Uso

### **Per Sviluppo Normale**
1. Avvia `npm run watch` in un terminale
2. Lascia il terminale aperto
3. Modifica i file normalmente
4. Le modifiche verranno salvate automaticamente

### **Per Sincronizzazione Rapida**
```bash
npm run sync
```

### **Per Controllare lo Stato**
```bash
npm run git:status
```

## 🚨 Risoluzione Problemi

### **Se la sincronizzazione non funziona:**
1. Verifica la connessione internet
2. Controlla le credenziali GitHub
3. Esegui `npm run git:config`
4. Riavvia il monitoraggio

### **Se ci sono conflitti:**
1. Ferma il monitoraggio (Ctrl+C)
2. Risolvi i conflitti manualmente
3. Riavvia il monitoraggio

## 📱 Sincronizzazione da Altri Dispositivi

Le modifiche fatte da altri dispositivi o collaboratori vengono automaticamente scaricate quando:
- Esegui `npm run sync`
- Il monitoraggio automatico è attivo
- Esegui `git pull` manualmente

## 🔒 Sicurezza

- ✅ Solo i file del progetto vengono sincronizzati
- ✅ File sensibili (.env) sono esclusi
- ✅ Node_modules e file temporanei ignorati
- ✅ Commit automatici con timestamp

## 📞 Supporto

Se hai problemi con la sincronizzazione:
1. Controlla questo README
2. Verifica la connessione GitHub
3. Controlla i log del terminale
4. Riavvia il monitoraggio automatico

---

**🎯 Obiettivo**: Sviluppo senza preoccupazioni - ogni modifica viene salvata automaticamente su GitHub!
