import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';
import { ChatService } from '../services/chat';
import { ChatMessage, User } from '../types';
import { supabase } from '../services/supabase';

interface ChatScreenProps {
  navigation: any;
}

export default function ChatScreen({ navigation, route }: ChatScreenProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatPartner, setChatPartner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    if (chatPartner) {
      loadMessages();
      
      // Subscribe to real-time messages
      const subscription = ChatService.subscribeToMessages(chatPartner.id, (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [chatPartner]);

  const initializeChat = async () => {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      // Get chat partner (coach for client, or specific client for coach)
      const partnerResponse = await ChatService.getChatPartner();
      if (partnerResponse.success && partnerResponse.data) {
        setChatPartner(partnerResponse.data);
      }
    } catch (error: any) {
      console.error('Initialize chat error:', error);
      Alert.alert('Errore', 'Errore nel caricamento della chat');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!chatPartner) return;

    try {
      const response = await ChatService.getChatMessages(chatPartner.id);
      if (response.success && response.data) {
        setMessages(response.data);
        // Mark messages as read
        await ChatService.markMessagesAsRead(chatPartner.id);
        scrollToBottom();
      }
    } catch (error: any) {
      console.error('Load messages error:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !chatPartner || sending) return;

    const messageText = message.trim();
    setMessage('');
    setSending(true);

    try {
      const response = await ChatService.sendMessage(chatPartner.id, messageText);
      if (response.success && response.data) {
        setMessages(prev => [...prev, response.data!]);
        scrollToBottom();
      } else {
        Alert.alert('Errore', response.error || 'Errore nell\'invio del messaggio');
        setMessage(messageText); // Restore message on error
      }
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore nell\'invio del messaggio');
      setMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annulla', 'Fotocamera', 'Galleria'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            await uploadImage(true);
          } else if (buttonIndex === 2) {
            await uploadImage(false);
          }
        }
      );
    } else {
      Alert.alert(
        'Seleziona Immagine',
        'Scegli come aggiungere la foto',
        [
          { text: 'Annulla', style: 'cancel' },
          { text: 'Fotocamera', onPress: () => uploadImage(true) },
          { text: 'Galleria', onPress: () => uploadImage(false) },
        ]
      );
    }
  };

  const uploadImage = async (useCamera: boolean) => {
    if (!chatPartner || sending) return;

    setSending(true);
    try {
      const imageUri = await ChatService.pickImage(useCamera);
      if (imageUri) {
        const response = await ChatService.sendImageMessage(chatPartner.id, imageUri, 'Foto inviata');
        if (response.success && response.data) {
          setMessages(prev => [...prev, response.data!]);
          scrollToBottom();
        } else {
          Alert.alert('Errore', response.error || 'Errore nell\'invio dell\'immagine');
        }
      }
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore nell\'upload dell\'immagine');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Chat {chatPartner ? `con ${chatPartner.first_name}` : ''}
        </Text>
        <Text style={styles.headerSubtitle}>
          {chatPartner?.role === 'coach' ? 'Il tuo coach' : 'Cliente'}
        </Text>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer} 
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollToBottom()}
      >
        {messages.map((msg) => {
          const isMyMessage = msg.sender_id === currentUserId;
          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                isMyMessage ? styles.clientMessageRow : styles.coachMessageRow,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isMyMessage ? styles.clientMessage : styles.coachMessage,
                ]}
              >
                {msg.message_type === 'image' && msg.image_url ? (
                  <View>
                    <Image source={{ uri: msg.image_url }} style={styles.messageImage} />
                    {msg.content !== 'Foto inviata' && (
                      <Text style={styles.messageText}>{msg.content}</Text>
                    )}
                  </View>
                ) : (
                  <Text style={styles.messageText}>{msg.content}</Text>
                )}
                <Text style={styles.messageTime}>{formatTime(msg.created_at)}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.imageButton}
          onPress={handleImageUpload}
          disabled={sending}
        >
          <Text style={styles.imageButtonText}>📷</Text>
        </TouchableOpacity>
        
        <TextInput
          style={styles.textInput}
          placeholder="Scrivi un messaggio..."
          placeholderTextColor={Colors.textTertiary}
          value={message}
          onChangeText={setMessage}
          multiline
          editable={!sending}
        />
        
        <TouchableOpacity 
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={Colors.text} />
          ) : (
            <Text style={styles.sendButtonText}>Invia</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageRow: {
    marginBottom: 16,
  },
  clientMessageRow: {
    alignItems: 'flex-end',
  },
  coachMessageRow: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
  },
  clientMessage: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  coachMessage: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 12,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'flex-end',
  },
  imageButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageButtonText: {
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    color: Colors.text,
    fontSize: 16,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
});