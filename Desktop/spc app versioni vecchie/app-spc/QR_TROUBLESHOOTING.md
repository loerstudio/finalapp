# Risoluzione Problemi QR Code - SPC Fitness

## Problemi Comuni e Soluzioni

### 🔴 Problema: App si blocca all'apertura del QR Code

**Possibili Cause:**
- Dipendenze non installate correttamente
- Permessi fotocamera non configurati
- Versione Expo non compatibile

**Soluzioni:**
1. **Reinstalla le dipendenze:**
   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Pulisci la cache di Expo:**
   ```bash
   npx expo start --clear
   ```

3. **Verifica i permessi in app.json:**
   ```json
   {
     "plugins": [
       [
         "expo-camera",
         {
           "cameraPermission": "Permesso fotocamera per QR code"
         }
       ]
     ]
   }
   ```

### 🔴 Problema: Fotocamera non si apre

**Possibili Cause:**
- Permesso fotocamera negato
- Problema con expo-camera
- Dispositivo non supportato

**Soluzioni:**
1. **Controlla i permessi:**
   - Impostazioni dispositivo → SPC Fitness → Fotocamera
   - Abilita il permesso

2. **Riavvia l'app:**
   - Chiudi completamente l'app
   - Riapri e riprova

3. **Testa su dispositivo fisico:**
   - Alcuni emulatori hanno problemi con la fotocamera
   - Usa un dispositivo reale per testare

### 🔴 Problema: QR Code non si scansiona

**Possibili Cause:**
- Illuminazione insufficiente
- QR code danneggiato o troppo piccolo
- Problema con il frame di scansione

**Soluzioni:**
1. **Migliora l'illuminazione:**
   - Usa luce diretta sul QR code
   - Evita riflessi e ombre

2. **Posiziona correttamente:**
   - Centra il QR code nel riquadro
   - Mantieni il dispositivo fermo
   - Avvicina il dispositivo se necessario

3. **Testa con QR code diversi:**
   - Usa QR code generati online
   - Verifica che il QR code non sia danneggiato

### 🔴 Problema: QR Code non si genera

**Possibili Cause:**
- Libreria react-native-qrcode-svg non funziona
- Dati troppo lunghi o complessi
- Problema di memoria

**Soluzioni:**
1. **Verifica l'installazione:**
   ```bash
   npm list react-native-qrcode-svg
   npm list react-native-svg
   ```

2. **Reinstalla le librerie:**
   ```bash
   npm uninstall react-native-qrcode-svg react-native-svg
   npm install react-native-qrcode-svg react-native-svg
   ```

3. **Testa con dati semplici:**
   - Usa stringhe corte per testare
   - Evita caratteri speciali

### 🔴 Problema: Errore "Module not found"

**Possibili Cause:**
- Dipendenze mancanti
- Cache Metro non aggiornata
- Problema di import

**Soluzioni:**
1. **Installa dipendenze mancanti:**
   ```bash
   npm install expo-camera expo-barcode-scanner react-native-qrcode-svg react-native-svg
   ```

2. **Pulisci cache Metro:**
   ```bash
   npx expo start --clear
   ```

3. **Verifica gli import:**
   ```javascript
   import { Camera } from 'expo-camera';
   import { BarCodeScanner } from 'expo-barcode-scanner';
   import QRCode from 'react-native-qrcode-svg';
   ```

### 🔴 Problema: App lenta con QR Code

**Possibili Cause:**
- Troppi re-render
- Memoria insufficiente
- Problema di performance

**Soluzioni:**
1. **Ottimizza il rendering:**
   - Usa React.memo per componenti
   - Evita calcoli complessi nel render

2. **Gestisci la memoria:**
   - Pulisci i listener quando necessario
   - Usa useCallback per funzioni

3. **Testa su dispositivo più potente:**
   - Alcuni dispositivi vecchi possono essere lenti

## Test di Funzionalità

### Test QR Code Generation
```javascript
// Test semplice
const testData = "Test QR Code";
<QRCode value={testData} size={100} />

// Test con dati complessi
const complexData = JSON.stringify({
  id: "test-123",
  type: "user",
  data: { name: "Test User" }
});
```

### Test QR Code Scanning
```javascript
// Test con BarCodeScanner
<BarCodeScanner
  onBarCodeScanned={({ type, data }) => {
    console.log('Scanned:', data);
  }}
  style={StyleSheet.absoluteFillObject}
/>
```

## Debugging

### Abilita Logging
```javascript
// Nel QRCodeService
console.log('QR Data:', qrData);
console.log('Parsed QR:', parsed);
```

### Test Component
Usa il componente `QRCodeTest` per testare:
- Generazione QR code
- Parsing QR code
- Funzionalità base

## Controlli di Sicurezza

### Verifica Permessi
```javascript
const { status } = await Camera.requestCameraPermissionsAsync();
console.log('Camera permission:', status);
```

### Gestione Errori
```javascript
try {
  const qrData = QRCodeService.parseQRCodeData(qrString);
  // Processa QR code
} catch (error) {
  console.error('QR Error:', error);
  Alert.alert('Errore', 'Problema con il QR code');
}
```

## Supporto

Se i problemi persistono:

1. **Controlla la console** per errori specifici
2. **Testa su dispositivo diverso** per isolare il problema
3. **Verifica la versione di Expo** e le dipendenze
4. **Controlla la documentazione** delle librerie utilizzate

## Comandi Utili

```bash
# Pulisci tutto e reinstalla
rm -rf node_modules package-lock.json
npm install

# Riavvia Expo con cache pulita
npx expo start --clear

# Verifica dipendenze
npm audit

# Aggiorna Expo CLI
npm install -g @expo/cli@latest
``` 