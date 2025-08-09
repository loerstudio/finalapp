1. Project Overview
Obiettivo: Sviluppare un’app mobile fitness con AI e funzionalità complete di gestione clienti/allenamenti/chat, usando:

Frontend: React Native puro (Expo opzionale solo se compatibile)

Backend: Node.js + Supabase (DB, Auth, Storage)

AI: Deepseek (note processing) + Gemini (food recognition)

Key Points:

Design minimalista, pulito, super intuitivo

Navigazione bottom nativa con icone grandi

UI e testo grandi e leggibili, zero elementi decorativi inutili

Sicurezza e performance elevate

Funzioni dedicate a Coach e Cliente basate sul token

2. Functional Requirements
2.1 Autenticazione
Solo Login: email + password

Supabase Auth con verifica credenziali tramite backend Node.js

UI: login minimalista (bottone LOGIN gigante rosso #8B0000)

Gestione errori chiara in italiano

Logout con pulizia token e ritorno alla login

2.2 Navigazione
Bottom navigation nativa con 4 icone grandi

Dashboard personalizzata in base al ruolo:

Coach: lista clienti con foto grandi

Cliente: 4 riquadri grandi → Allenamento, Alimentazione, Progressi, Chat

2.3 Chat 1-to-1 (Coach <-> Cliente)
Stile WhatsApp (colori brand)

Testo + immagini/video (preview + apertura full screen)

Indicatori di lettura

Lista conversazioni

Messaggi salvati su Supabase DB

Upload con compressione lato client + indicatore caricamento

2.4 Gestione Allenamenti (Coach)
Calendario settimanale nativo

Lista esercizi predefiniti (10 iniziali)

Form semplice: nome esercizio, serie, ripetizioni

Salvataggio su Supabase DB

Assegnazione esercizi a cliente specifico

UI drag & drop se fluido

2.5 Vista Allenamenti (Cliente)
Mostra allenamento del giorno assegnato

Lista esercizi con serie, ripetizioni, checkbox grandi

Bottone INIZIA ALLENAMENTO rosso gigante

Timer nativo

Modalità read-only

2.6 Live Workout + Log
Un esercizio a schermo intero alla volta

Input grandi per peso/ripetizioni con bottoni +/-

Timer rest tra serie

Bottone PROSSIMO ESERCIZIO enorme

Salvataggio dati in tempo reale

2.7 Progressi Cliente
Form peso + foto (fronte/retro) con compressione upload

Calendario storico

Grafico peso filtrabile (giorni, settimane, mesi, anno, intervallo custom)

Slider confronto foto prima/dopo

Coach → solo visualizzazione

2.8 Obiettivi e Tracking
Creazione obiettivi (es. perdere 5kg in 2 mesi)

Progress bar grande

Aggiornamenti giornalieri semplici

Notifiche native reminder

Animazione di celebrazione al completamento

2.9 Piano Alimentare
Coach crea piano diviso in pasti

Lista alimenti con quantità e checkbox

Calcolo calorie/macros lato backend

Cliente → spunta pasti completati

2.10 Database Alimenti
100 alimenti iniziali

Ricerca rapida via backend API

Info base (calorie, proteine, carbo, grassi / 100g)

Categorie intuitive

Coach può aggiungere alimenti custom

2.11 Food Scan (AI)
Bottone fotocamera grande

Foto inviata a Gemini API via backend

Risultato con conferma e modifica quantità

Aggiunta rapida al diario alimentare

2.12 Libreria Esercizi Completa
+50 esercizi con descrizioni

Filtri per gruppo muscolare

Icone visuali per ogni muscolo

Video tutorial (YouTube embed in WebView)

Ricerca veloce + preferiti

2.13 Notifiche Push
Reminder allenamenti

Nuovi messaggi

Progressi peso/foto

Messaggi motivazionali

Impostazioni on/off

3. Technical Specifications
3.1 Backend
Node.js + Express per API sicure

Connessione a Supabase (Auth, DB, Storage)

Row-Level Security attiva

3.2 Database (Supabase)
Tabelle principali:

users → id, email, role, created_at

notes → id, user_id, title, content, tags, created_at, updated_at

workouts, exercises, meal_plans, foods, chats, messages, progress

3.3 AI Integration

Gemini: food recognition da foto

3.4 Component Architecture (Frontend)
AuthStack: LoginScreen

MainStack: Dashboard, Chat, Allenamenti, Alimentazione, Progressi

Modals: AI processing, Media preview

4. Non-Functional Requirements
Avvio app < 2s

Note e dati offline (cache)

UI accessibile (min 18px font)

Test unitari funzioni core

Gestione errori globale

5. Development Milestones
Backend Setup (Supabase + Node.js) – 2 giorni

Auth + Dashboard – 3 giorni

Chat + Upload Media – 3 giorni

Allenamenti + Live Workout – 4 giorni

Progressi + Alimentazione – 4 giorni

AI Features (Deepseek + Gemini) – 3 giorni

Notifiche + Polish finale – 2 giorni

6. Risk Management
API Rate Limit: throttling + cache

Supabase misconfig: test multi-ruolo

Lentezza AI: loading states + timeout

7. Appendix
Supabase Docs: https://supabase.com/docs

Deepseek API: https://deepseek.ai/docs

Gemini API: https://ai.google.dev/gemini-api

React Native Navigation: https://reactnavigation.org