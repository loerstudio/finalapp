import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { ChatService, ConversationItem } from '@/lib/chatService';
import { Message, User } from '@/types';
import CoachSelector from '@/components/CoachSelector';

export default function ChatScreen() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCoachSelector, setShowCoachSelector] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);

  // Carica le conversazioni all'avvio e quando l'utente cambia
  useEffect(() => {
    if (user?.id) {
      loadConversations();
      // Sottoscriviti agli aggiornamenti delle conversazioni
      const subscription = ChatService.subscribeToConversations(user.id, (updatedChat) => {
        // Aggiorna la lista delle conversazioni quando cambia
        loadConversations();
      });
      
      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [user?.id]);

  // Carica i messaggi quando viene selezionata una chat
  useEffect(() => {
    if (selectedChat && user?.id) {
      loadMessages(selectedChat);
      // Segna i messaggi come letti
      ChatService.markMessagesAsRead(selectedChat, user.id);
      
      // Sottoscriviti ai nuovi messaggi per questa chat
      const subscription = ChatService.subscribeToMessages(selectedChat, (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
        // Aggiorna la lista delle conversazioni per aggiornare l'ultimo messaggio
        loadConversations();
      });
      
      return () => {
        ChatService.unsubscribeFromMessages(selectedChat);
      };
    }
  }, [selectedChat, user?.id]);

  // Cleanup delle sottoscrizioni quando il componente viene smontato
  useEffect(() => {
    return () => {
      ChatService.unsubscribeFromAll();
    };
  }, []);

  const loadConversations = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const conversationsData = await ChatService.getConversations(user.id);
      setConversations(conversationsData);
    } catch (error) {
      console.error('Errore nel caricamento delle conversazioni:', error);
      Alert.alert('Errore', 'Impossibile caricare le conversazioni');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const messagesData = await ChatService.getMessages(chatId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Errore nel caricamento dei messaggi:', error);
      Alert.alert('Errore', 'Impossibile caricare i messaggi');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user?.id) return;

    try {
      const message = await ChatService.sendMessage(selectedChat, user.id, newMessage.trim());
      if (message) {
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        // Ricarica le conversazioni per aggiornare l'ultimo messaggio
        loadConversations();
      }
    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error);
      Alert.alert('Errore', 'Impossibile inviare il messaggio');
    }
  };

  const handleNewConversation = () => {
    if (!user?.id) {
      Alert.alert('Errore', 'Devi essere autenticato per creare una conversazione');
      return;
    }
    setShowCoachSelector(true);
  };

  const handleSelectCoach = async (coach: User) => {
    if (!user?.id) return;

    try {
      const chat = await ChatService.createConversation(user.id, coach.id);
      if (chat) {
        // Ricarica le conversazioni
        await loadConversations();
        // Seleziona la nuova conversazione
        const newConversation = conversations.find(c => c.id === chat.id);
        if (newConversation) {
          setSelectedConversation(newConversation);
          setSelectedChat(chat.id);
        }
      }
      setShowCoachSelector(false);
    } catch (error) {
      console.error('Errore nella creazione della conversazione:', error);
      Alert.alert('Errore', 'Impossibile creare la conversazione');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    if (selectedChat) {
      await loadMessages(selectedChat);
    }
    setRefreshing(false);
  };

  const renderConversationItem = ({ item }: { item: ConversationItem }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        selectedConversation?.id === item.id && styles.selectedConversation
      ]}
      onPress={() => {
        setSelectedConversation(item);
        setSelectedChat(item.id);
      }}
    >
      <View style={styles.conversationInfo}>
        <Text style={styles.conversationName}>{item.name}</Text>
        <Text style={styles.conversationTimestamp}>
          {new Date(item.timestamp).toLocaleDateString('it-IT')}
        </Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender_id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTimestamp,
            isOwnMessage ? styles.ownMessageTimestamp : styles.otherMessageTimestamp
          ]}>
            {new Date(item.created_at).toLocaleTimeString('it-IT', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (showCoachSelector) {
    return (
      <CoachSelector
        onSelectCoach={handleSelectCoach}
        onCancel={() => setShowCoachSelector(false)}
        currentUserId={user?.id || ''}
      />
    );
  }

  if (selectedConversation) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header della chat */}
          <View style={styles.chatHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setSelectedConversation(null);
                setSelectedChat(null);
                setMessages([]);
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.chatTitle}>{selectedConversation.name}</Text>
          </View>

          {/* Lista messaggi */}
          <FlatList
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            style={styles.messagesList}
            inverted
            showsVerticalScrollIndicator={false}
          />

          {/* Input per nuovo messaggio */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Scrivi un messaggio..."
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !newMessage.trim() && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Chat</Text>
          <Text style={styles.subtitle}>Parla con i tuoi coach</Text>
        </View>

        {/* Barra di ricerca */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cerca conversazioni..."
            placeholderTextColor="#999"
          />
        </View>

        {/* Lista conversazioni */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Caricamento conversazioni...</Text>
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Nessuna conversazione</Text>
            <Text style={styles.emptySubtitle}>
              Inizia a parlare con i tuoi coach per ricevere supporto e motivazione
            </Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Pulsante nuova conversazione */}
        <TouchableOpacity
          style={styles.newConversationButton}
          onPress={handleNewConversation}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.newConversationText}>Nuova Conversazione</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  conversationsContainer: {
    paddingHorizontal: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedConversation: {
    backgroundColor: '#e1e5e9',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  conversationTimestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  unreadBadge: {
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    paddingVertical: 15,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  newChatText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  // Chat view styles
  keyboardView: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    marginRight: 15,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chatHeaderStatus: {
    fontSize: 14,
    color: '#666',
  },
  moreButton: {
    marginLeft: 15,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  messageContainer: {
    marginBottom: 10,
  },
  clientMessage: {
    alignItems: 'flex-end',
  },
  coachMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clientBubble: {
    backgroundColor: '#FF6B35',
    borderBottomRightRadius: 5,
  },
  coachBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  clientText: {
    color: 'white',
  },
  coachText: {
    color: '#333',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  messageTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginRight: 5,
  },
  readIndicator: {
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  attachButton: {
    marginRight: 10,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#e1e5e9',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  // New styles for real-time chat
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  ownMessageBubble: {
    backgroundColor: '#FF6B35',
    borderBottomRightRadius: 5,
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTimestamp: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
  },
  ownMessageTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTimestamp: {
    color: 'rgba(51, 51, 51, 0.7)',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    marginRight: 10,
  },
  newConversationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    paddingVertical: 15,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  newConversationText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#666',
    marginTop: 10,
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
