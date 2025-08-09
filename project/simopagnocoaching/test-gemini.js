// Test script per verificare l'API Gemini
const GEMINI_API_KEY = 'AIzaSyD9n5iBwhcIyNKU3tSSNdCS1hI97vOHBTs';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function testGeminiAPI() {
  console.log('🧪 Testando API Gemini...');
  
  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Ciao! Rispondi solo con 'Gemini funziona!' se ricevi questo messaggio."
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 100,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    const content = result.candidates[0].content.parts[0].text;
    
    console.log('✅ Gemini API funziona!');
    console.log('📝 Risposta:', content);
    console.log('🔑 Chiave API valida');
    
  } catch (error) {
    console.error('❌ Errore test Gemini:', error.message);
    
    if (error.message.includes('403')) {
      console.log('💡 Possibile problema: Chiave API non valida o quota superata');
    } else if (error.message.includes('429')) {
      console.log('💡 Possibile problema: Troppe richieste, riprova tra un minuto');
    } else {
      console.log('💡 Possibile problema: Errore di rete o configurazione');
    }
  }
}

// Esegui il test
testGeminiAPI(); 