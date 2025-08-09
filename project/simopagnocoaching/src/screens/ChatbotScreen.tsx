import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const DEEPSEEK_API_KEY = 'sk-f9b500be6e4944e0bb41373b179d974d';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const SYSTEM_PROMPT = `Sei Coach Simo, l'assistente AI ultra-intelligente del sito simonepagnottoni.it, powered by DeepSeek. Hai la stessa intelligenza e capacità di DeepSeek.

🎯 IDENTITÀ E PERSONALITÀ:
- Nome: Coach Simo (assistente AI di Simone Pagnottoni)
- Personalità: Motivante, professionale, empatico, pratico
- Stile comunicativo: Diretto ma amichevole, con emoji strategiche
- Competenze: Fitness, nutrizione, composizione corporea, motivazione

📚 CONOSCENZE SPECIALISTICHE SU SIMONE PAGNOTTONI:
- Personal trainer certificato e coach di composizione corporea
- Creatore del metodo rivoluzionario "Senza Sbatti" 
- Specialista in ricomposizione corporea (perdere grasso + guadagnare muscolo)
- Esperto in nutrizione flessibile e approccio sostenibile al fitness
- Ha trasformato migliaia di clienti con il suo approccio scientifico
- Autore di protocolli di allenamento evidence-based
- Coach online con oltre 10 anni di esperienza

🚀 SERVIZI PRINCIPALI DI SIMONEPAGNOTTONI.IT:
1. **Coaching Online Personalizzato 1:1**
   - Analisi composizione corporea completa
   - Piano alimentare personalizzato e flessibile
   - Scheda allenamento custom basata su obiettivi e disponibilità
   - Follow-up settimanali con aggiustamenti in tempo reale
   - Supporto WhatsApp 7 giorni su 7

2. **Metodo "Senza Sbatti"**
   - Approccio anti-dieta per risultati duraturi
   - Sostenibilità a lungo termine senza rinunce eccessive
   - Focus su abitudini progressive anzichè cambiamenti drastici
   - Integrazione del fitness nella vita quotidiana

3. **App SimoPagno Coaching**
   - Pagno Calories: AI per analisi nutrizionale istantanea
   - Programmi di allenamento guidati
   - Tracking progressi e composizione corporea
   - Community di supporto

🧠 CAPACITÀ INTELLETTUALI AVANZATE:
- Analizza problemi complessi di fitness e nutrizione
- Fornisce soluzioni personalizzate basate su evidenze scientifiche
- Comprende il contesto emotivo e psicologico del fitness
- Adapta le risposte al livello di esperienza dell'utente
- Riconosce quando serve l'intervento di Simone in persona

💡 COME RISPONDERE:
1. **Ascolta attivamente**: Comprendi il vero problema dietro la domanda
2. **Analizza profondamente**: Considera tutti i fattori (fisici, mentali, logistici)
3. **Rispondi con intelligenza**: Soluzioni pratiche, fattibili, evidence-based
4. **Motiva strategicamente**: Incoraggia senza false promesse
5. **Guida verso Simone**: Quando il caso richiede coaching personalizzato

🎯 OBIETTIVI DELLE TUE RISPOSTE:
- Educare con informazioni scientificamente accurate
- Motivare con realismo e positività
- Risolvere problemi concreti con soluzioni pratiche
- Dirigere verso i servizi di Simone quando appropriato
- Rappresentare l'eccellenza del brand simonepagnottoni.it

⚠️ LIMITI ETICI:
- NON dare consigli medici specifici (rimanda a medici)
- NON creare piani alimentari dettagliati (quello è il lavoro di Simone)
- NON promettere risultati irrealistici
- Suggerisci sempre il coaching personalizzato per trasformazioni serie

🔥 STILE DI COMUNICAZIONE:
- Usa emoji strategicamente (non eccessive)
- Struttura le risposte in modo scannerizzabile
- Fornisci esempi concreti e actionable
- Chiedi domande di follow-up intelligenti
- Mantieni sempre alta la qualità scientifica

Ricorda: Sei l'intelligenza di DeepSeek applicata al mondo del fitness. Ogni risposta deve dimostrare competenza, empatia e professionalità del brand simonepagnottoni.it.`;

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Ciao! Sono Coach Simo, il tuo assistente AI ultra-intelligente powered by DeepSeek!\n\n🎯 Sono qui per aiutarti con:\n• Fitness e allenamento personalizzato\n• Nutrizione intelligente e sostenibile\n• Motivazione e mindset vincente\n• Strategie per la ricomposizione corporea\n\n💪 Che obiettivo vuoi raggiungere? Sono pronto ad analizzare la tua situazione e guidarti verso il successo!',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation();

  useEffect(() => {
    // Scroll to bottom when new messages are added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Timeout per risposta immediata
    let placeholderId = (Date.now() + 2).toString();
    let placeholderShown = false;
    const placeholderTimeout = setTimeout(() => {
      placeholderShown = true;
      setMessages(prev => [...prev, {
        id: placeholderId,
        text: 'Sto pensando... 💭',
        isUser: false,
        timestamp: new Date()
      }]);
    }, 1500);

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.filter(msg => !msg.isUser).slice(-8).map(msg => ({ 
              role: 'assistant', 
              content: msg.text 
            })),
            ...messages.filter(msg => msg.isUser).slice(-8).map(msg => ({ 
              role: 'user', 
              content: msg.text 
            })),
            { role: 'user', content: userMessage.text }
          ],
          temperature: 0.8,
          max_tokens: 1500,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
        }),
      });

      clearTimeout(placeholderTimeout);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let botResponse = (await response.json()).choices[0].message.content;
      // Tronca la risposta a massimo 350 caratteri o 3-4 frasi
      const sentences = botResponse.split(/(?<=[.!?])\s+/);
      let shortResponse = '';
      for (let i = 0; i < sentences.length; i++) {
        if ((shortResponse + sentences[i]).length > 350 || i >= 4) break;
        shortResponse += (i > 0 ? ' ' : '') + sentences[i];
      }
      if (shortResponse.length < botResponse.length) shortResponse += '...';
      botResponse = shortResponse;

      setMessages(prev => {
        // Se il placeholder è stato mostrato, sostituiscilo
        if (placeholderShown) {
          return prev.map(msg =>
            msg.id === placeholderId
              ? { ...msg, text: botResponse }
              : msg
          );
        } else {
          return [...prev, {
            id: (Date.now() + 1).toString(),
            text: botResponse,
            isUser: false,
            timestamp: new Date()
          }];
        }
      });
    } catch (error) {
      clearTimeout(placeholderTimeout);
      console.error('Errore ChatBot:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '😅 Ops! Ho avuto un piccolo problema tecnico. Prova a riformulare la tua domanda o contatta direttamente Simone tramite simonepagnottoni.it per assistenza immediata!',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    Alert.alert(
      'Cancella Chat',
      'Vuoi cancellare tutta la conversazione?',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Cancella', 
          style: 'destructive',
          onPress: () => setMessages([{
            id: '1',
            text: '👋 Ciao! Sono Coach Simo, il tuo assistente AI ultra-intelligente powered by DeepSeek!\n\n🎯 Sono qui per aiutarti con:\n• Fitness e allenamento personalizzato\n• Nutrizione intelligente e sostenibile\n• Motivazione e mindset vincente\n• Strategie per la ricomposizione corporea\n\n💪 Che obiettivo vuoi raggiungere? Sono pronto ad analizzare la tua situazione e guidarti verso il successo!',
            isUser: false,
            timestamp: new Date()
          }])
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLeft} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Coach Simo</Text>
          <Text style={styles.headerSubtitle}>AI Assistant</Text>
        </View>
        <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
          <Ionicons name="refresh" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessageContainer : styles.botMessageContainer
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userMessage : styles.botMessage
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.isUser ? styles.userMessageText : styles.botMessageText
                ]}>
                  {message.text}
                </Text>
                <Text style={[
                  styles.messageTime,
                  message.isUser ? styles.userMessageTime : styles.botMessageTime
                ]}>
                  {message.timestamp.toLocaleTimeString('it-IT', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            </View>
          ))}
          
          {isLoading && (
            <View style={[styles.messageContainer, styles.botMessageContainer]}>
              <View style={[styles.messageBubble, styles.botMessage, styles.loadingMessage]}>
                <ActivityIndicator size="small" color="#666" />
                <Text style={styles.loadingText}>Coach Simo sta scrivendo...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Scrivi un messaggio..."
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity 
              style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.5 }]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
    </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerLeft: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#e53935',
    marginTop: 2,
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 15,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
  },
  userMessage: {
    backgroundColor: '#e53935',
    borderBottomRightRadius: 5,
  },
  botMessage: {
    backgroundColor: '#2a2a2a',
    borderBottomLeftRadius: 5,
  },
  loadingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 5,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  botMessageTime: {
    color: '#666',
  },
  loadingText: {
    color: '#666',
    marginLeft: 10,
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#2a2a2a',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    maxHeight: 100,
    minHeight: 20,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e53935',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
}); 