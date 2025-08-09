#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Iniziando sincronizzazione automatica...');

try {
    // Controlla se ci sono modifiche
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (status.trim()) {
        console.log('📝 Trovate modifiche, procedendo con il commit...');
        
        // Aggiungi tutte le modifiche
        execSync('git add .', { stdio: 'inherit' });
        
        // Crea un commit con timestamp
        const timestamp = new Date().toLocaleString('it-IT');
        execSync(`git commit -m "🔄 Auto-sync: ${timestamp}"`, { stdio: 'inherit' });
        
        // Push su GitHub
        console.log('🚀 Invio modifiche su GitHub...');
        execSync('git push origin main', { stdio: 'inherit' });
        console.log('✅ Sincronizzazione completata con successo!');
    } else {
        console.log('✨ Nessuna modifica da sincronizzare');
    }
    
    // Pull per verificare se ci sono aggiornamenti esterni
    console.log('📥 Controllo aggiornamenti esterni...');
    try {
        execSync('git pull origin main', { stdio: 'inherit' });
        console.log('✅ Progetto aggiornato con le ultime modifiche da GitHub');
    } catch (error) {
        console.log('⚠️  Nessun aggiornamento esterno o conflitti risolti');
    }
    
    console.log('🎉 Sincronizzazione completata!');
    
} catch (error) {
    console.error('❌ Errore durante la sincronizzazione:', error.message);
    process.exit(1);
}
