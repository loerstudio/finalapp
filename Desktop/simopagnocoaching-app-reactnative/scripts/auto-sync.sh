#!/bin/bash

# Script per la sincronizzazione automatica con GitHub
# Questo script può essere eseguito manualmente o tramite cron job

echo "🔄 Iniziando sincronizzazione automatica..."

# Controlla se ci sono modifiche
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 Trovate modifiche, procedendo con il commit..."
    
    # Aggiungi tutte le modifiche
    git add .
    
    # Crea un commit con timestamp
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    git commit -m "🔄 Auto-sync: $TIMESTAMP"
    
    # Push su GitHub
    echo "🚀 Invio modifiche su GitHub..."
    if git push origin main; then
        echo "✅ Sincronizzazione completata con successo!"
    else
        echo "❌ Errore durante il push su GitHub"
        exit 1
    fi
else
    echo "✨ Nessuna modifica da sincronizzare"
fi

# Pull per verificare se ci sono aggiornamenti esterni
echo "📥 Controllo aggiornamenti esterni..."
if git pull origin main; then
    echo "✅ Progetto aggiornato con le ultime modifiche da GitHub"
else
    echo "⚠️  Nessun aggiornamento esterno o conflitti risolti"
fi

echo "🎉 Sincronizzazione completata!"
