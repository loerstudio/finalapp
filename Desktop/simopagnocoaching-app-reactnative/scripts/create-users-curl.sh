#!/bin/bash

# Configurazione Supabase
SUPABASE_URL="https://mlltbyzjeoakfculpvrg.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sbHRieXpqZW9ha2ZjdWxwdnJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY0MzU2NywiZXhwIjoyMDcwMjE5NTY3fQ.nEK6jA3jfqJDWRr2Py8-nTSQUsV5sT3ViPdEp4w9PPo"

echo "🚀 Creazione utenti tramite REST API (curl)..."

# 1. Crea utente Coach
echo "👨‍💼 Creazione utente Coach..."
COACH_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "apikey: $SERVICE_KEY" \
  -d '{
    "email": "loerstudio0@gmail.com",
    "password": "Coach123!",
    "email_confirm": true,
    "user_metadata": {
      "name": "Loer 0 coach",
      "role": "coach"
    }
  }' \
  "$SUPABASE_URL/auth/v1/admin/users")

# Estrai status code e response body
COACH_HTTP_CODE=$(echo "$COACH_RESPONSE" | tail -n1)
COACH_BODY=$(echo "$COACH_RESPONSE" | head -n -1)

echo "Coach HTTP Status: $COACH_HTTP_CODE"
echo "Coach Response: $COACH_BODY"

if [ "$COACH_HTTP_CODE" -eq 200 ]; then
    echo "✅ Coach creato con successo!"
    # Estrai l'ID dell'utente dalla response
    COACH_ID=$(echo "$COACH_BODY" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "Coach ID: $COACH_ID"
else
    echo "❌ Errore creazione coach"
    exit 1
fi

# 2. Crea utente Cliente
echo -e "\n👤 Creazione utente Cliente..."
CLIENT_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "apikey: $SERVICE_KEY" \
  -d '{
    "email": "itsilorenz07@gmail.com",
    "password": "ItsIlor1",
    "email_confirm": true,
    "user_metadata": {
      "name": "Lorenzo cliente",
      "role": "client"
    }
  }' \
  "$SUPABASE_URL/auth/v1/admin/users")

# Estrai status code e response body
CLIENT_HTTP_CODE=$(echo "$CLIENT_RESPONSE" | tail -n1)
CLIENT_BODY=$(echo "$CLIENT_RESPONSE" | head -n -1)

echo "Client HTTP Status: $CLIENT_HTTP_CODE"
echo "Client Response: $CLIENT_BODY"

if [ "$CLIENT_HTTP_CODE" -eq 200 ]; then
    echo "✅ Cliente creato con successo!"
    # Estrai l'ID dell'utente dalla response
    CLIENT_ID=$(echo "$CLIENT_BODY" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "Client ID: $CLIENT_ID"
else
    echo "❌ Errore creazione cliente"
    exit 1
fi

# 3. Crea profilo Coach
echo -e "\n📝 Creazione profilo coach..."
COACH_PROFILE_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "apikey: $SERVICE_KEY" \
  -H "Prefer: return=representation" \
  -d "{
    \"id\": \"$COACH_ID\",
    \"email\": \"loerstudio0@gmail.com\",
    \"name\": \"Loer 0 coach\",
    \"role\": \"coach\"
  }" \
  "$SUPABASE_URL/rest/v1/profiles")

COACH_PROFILE_HTTP_CODE=$(echo "$COACH_PROFILE_RESPONSE" | tail -n1)
COACH_PROFILE_BODY=$(echo "$COACH_PROFILE_RESPONSE" | head -n -1)

if [ "$COACH_PROFILE_HTTP_CODE" -eq 201 ]; then
    echo "✅ Profilo coach creato"
else
    echo "❌ Errore profilo coach: $COACH_PROFILE_BODY"
fi

# 4. Crea profilo Cliente
echo -e "\n📝 Creazione profilo cliente..."
CLIENT_PROFILE_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "apikey: $SERVICE_KEY" \
  -H "Prefer: return=representation" \
  -d "{
    \"id\": \"$CLIENT_ID\",
    \"email\": \"itsilorenz07@gmail.com\",
    \"name\": \"Lorenzo cliente\",
    \"role\": \"client\"
  }" \
  "$SUPABASE_URL/rest/v1/profiles")

CLIENT_PROFILE_HTTP_CODE=$(echo "$CLIENT_PROFILE_RESPONSE" | tail -n1)
CLIENT_PROFILE_BODY=$(echo "$CLIENT_PROFILE_RESPONSE" | head -n -1)

if [ "$CLIENT_PROFILE_HTTP_CODE" -eq 201 ]; then
    echo "✅ Profilo cliente creato"
else
    echo "❌ Errore profilo cliente: $CLIENT_PROFILE_BODY"
fi

# 5. Crea chat
echo -e "\n💬 Creazione chat..."
CHAT_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "apikey: $SERVICE_KEY" \
  -H "Prefer: return=representation" \
  -d "{
    \"coach_id\": \"$COACH_ID\",
    \"client_id\": \"$CLIENT_ID\"
  }" \
  "$SUPABASE_URL/rest/v1/chats")

CHAT_HTTP_CODE=$(echo "$CHAT_RESPONSE" | tail -n1)
CHAT_BODY=$(echo "$CHAT_RESPONSE" | head -n -1)

if [ "$CHAT_HTTP_CODE" -eq 201 ]; then
    echo "✅ Chat creata"
    # Estrai l'ID della chat
    CHAT_ID=$(echo "$CHAT_BODY" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "Chat ID: $CHAT_ID"
    
    # 6. Crea messaggio di benvenuto
    echo -e "\n📝 Creazione messaggio di benvenuto..."
    MESSAGE_RESPONSE=$(curl -s -w "\n%{http_code}" \
      -X POST \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $SERVICE_KEY" \
      -H "apikey: $SERVICE_KEY" \
      -H "Prefer: return=representation" \
      -d "{
        \"chat_id\": \"$CHAT_ID\",
        \"sender_id\": \"$COACH_ID\",
        \"content\": \"Ciao Lorenzo! Sono Loer, il tuo coach personale. Iniziamo questo percorso insieme! 💪\",
        \"message_type\": \"text\"
      }" \
      "$SUPABASE_URL/rest/v1/messages")
    
    MESSAGE_HTTP_CODE=$(echo "$MESSAGE_RESPONSE" | tail -n1)
    MESSAGE_BODY=$(echo "$MESSAGE_RESPONSE" | head -n -1)
    
    if [ "$MESSAGE_HTTP_CODE" -eq 201 ]; then
        echo "✅ Messaggio di benvenuto creato"
    else
        echo "❌ Errore messaggio: $MESSAGE_BODY"
    fi
else
    echo "❌ Errore chat: $CHAT_BODY"
fi

echo -e "\n🎉 CREAZIONE UTENTI COMPLETATA!"
echo -e "\n🔑 Credenziali per il login:"
echo "Coach: loerstudio0@gmail.com / Coach123!"
echo "Cliente: itsilorenz07@gmail.com / ItsIlor1"
