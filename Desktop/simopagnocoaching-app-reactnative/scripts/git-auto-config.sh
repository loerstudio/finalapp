#!/bin/bash

# Script per configurare Git per il salvataggio automatico

echo "🔧 Configurazione Git per salvataggio automatico..."

# Configura Git per il salvataggio automatico
git config --global core.autocrlf input
git config --global core.safecrlf warn

# Configura il branch principale
git config --global init.defaultBranch main

# Configura il merge strategy
git config --global pull.rebase false
git config --global merge.ff false

# Configura i messaggi di commit
git config --global core.editor "code --wait"

# Configura il log format
git config --global log.decorate auto
git config --global log.abbrevCommit true

# Configura il push automatico
git config --global push.autoSetupRemote true

# Configura il fetch automatico
git config --global fetch.prune true

# Configura il rebase automatico
git config --global rebase.autoStash true

echo "✅ Configurazione Git completata!"
echo ""
echo "📋 Configurazioni applicate:"
echo "   - Auto CRLF: input"
echo "   - Branch predefinito: main"
echo "   - Push automatico: abilitato"
echo "   - Fetch automatico: abilitato"
echo "   - Rebase automatico: abilitato"
echo ""
echo "🚀 Ora puoi usare:"
echo "   - npm run sync    (per sincronizzazione manuale)"
echo "   - ./scripts/auto-sync.sh (per sincronizzazione bash)"
echo "   - node scripts/auto-sync.js (per sincronizzazione Node.js)"
