#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('👀 Avvio monitoraggio automatico delle modifiche...');
console.log('📁 Directory monitorata:', process.cwd());
console.log('⏰ Sincronizzazione automatica ogni 30 secondi');
console.log('🔄 Premi Ctrl+C per fermare il monitoraggio\n');

let lastSync = Date.now();
const SYNC_INTERVAL = 30000; // 30 secondi

function syncChanges() {
    try {
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        
        if (status.trim()) {
            console.log(`\n🔄 [${new Date().toLocaleTimeString()}] Trovate modifiche, sincronizzando...`);
            
            // Aggiungi tutte le modifiche
            execSync('git add .', { stdio: 'inherit' });
            
            // Crea un commit con timestamp
            const timestamp = new Date().toLocaleString('it-IT');
            execSync(`git commit -m "🔄 Auto-sync: ${timestamp}"`, { stdio: 'inherit' });
            
            // Push su GitHub
            execSync('git push origin main', { stdio: 'inherit' });
            console.log('✅ Sincronizzazione completata!');
            
            lastSync = Date.now();
        }
    } catch (error) {
        console.error('❌ Errore durante la sincronizzazione:', error.message);
    }
}

function checkForExternalChanges() {
    try {
        // Fetch per controllare aggiornamenti esterni
        execSync('git fetch origin', { stdio: 'ignore' });
        
        // Controlla se ci sono aggiornamenti
        const localCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
        const remoteCommit = execSync('git rev-parse origin/main', { encoding: 'utf8' }).trim();
        
        if (localCommit !== remoteCommit) {
            console.log(`\n📥 [${new Date().toLocaleTimeString()}] Trovati aggiornamenti esterni, aggiornando...`);
            execSync('git pull origin main', { stdio: 'inherit' });
            console.log('✅ Progetto aggiornato!');
        }
    } catch (error) {
        // Ignora errori di fetch/pull
    }
}

// Sincronizzazione periodica
setInterval(() => {
    const now = Date.now();
    if (now - lastSync > SYNC_INTERVAL) {
        syncChanges();
        checkForExternalChanges();
    }
}, 10000); // Controlla ogni 10 secondi

// Sincronizzazione iniziale
syncChanges();

console.log('🚀 Monitoraggio attivo! Le modifiche verranno sincronizzate automaticamente.');
console.log('💡 Suggerimenti:');
console.log('   - Modifica i file normalmente');
console.log('   - Le modifiche verranno salvate automaticamente ogni 30 secondi');
console.log('   - Premi Ctrl+C per fermare il monitoraggio');
