import { supabaseChatService } from './supabaseChatService';
import { Chat, Message, User } from '@/types';

export interface ChatWithParticipants extends Chat {
  participants: User[];
  last_message?: Message;
  unread_count: number;
}

export interface ConversationItem {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
  participant: User;
}

export class ChatService {
  // Ottieni tutte le conversazioni dell'utente corrente
  static async getConversations(userId: string): Promise<Chat[]> {
    try {
      const { data: conversations, error } = await supabaseChatService.getConversations(userId);
      
      if (error) throw error;
      
      // Get the last message and unread count for each conversation
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conversation) => {
          const lastMessage = await supabaseChatService.getLastMessage(conversation.id);
          const unreadCount = await supabaseChatService.getUnreadCount(conversation.id, userId);
          
          return {
            ...conversation,
            lastMessage: lastMessage ? {
              id: lastMessage.id,
              content: lastMessage.content,
              timestamp: lastMessage.created_at,
              senderId: lastMessage.sender_id,
              isRead: lastMessage.is_read
            } : null,
            unreadCount: unreadCount || 0
          };
        })
      );
      
      return conversationsWithDetails;
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }

  // Ottieni i messaggi di una conversazione
  static async getMessages(chatId: string): Promise<Message[]> {
    try {
      const result = await supabaseChatService.getMessages(chatId);
      
      if (result.error) {
        console.error('Errore nel recupero messaggi:', result.error);
        return [];
      }
      
      // Converti SupabaseMessage in Message
      return result.messages.map(msg => ({
        id: msg.id,
        chat_id: msg.chat_id,
        sender_id: msg.sender_id,
        content: msg.content,
        message_type: msg.message_type,
        media_url: msg.media_url,
        is_read: msg.is_read,
        created_at: msg.created_at,
        sender: msg.sender,
      }));
    } catch (error) {
      console.error('Errore nel recupero dei messaggi:', error);
      return [];
    }
  }

  // Invia un nuovo messaggio
  static async sendMessage(chatId: string, senderId: string, content: string): Promise<Message | null> {
    try {
      const result = await supabaseChatService.sendMessage(chatId, senderId, content);
      
      if (result.error) {
        console.error('Errore nell\'invio messaggio:', result.error);
        return null;
      }
      
      if (result.message) {
        // Converti SupabaseMessage in Message
        return {
          id: result.message.id,
          chat_id: result.message.chat_id,
          sender_id: result.message.sender_id,
          content: result.message.content,
          message_type: result.message.message_type,
          media_url: result.message.media_url,
          is_read: result.message.is_read,
          created_at: result.message.created_at,
          sender: result.message.sender,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Errore nell\'invio del messaggio:', error);
      return null;
    }
  }

  // Crea una nuova conversazione
  static async createConversation(clientId: string, coachId: string): Promise<Chat | null> {
    try {
      const result = await supabaseChatService.createConversation(coachId, clientId);
      
      if (result.error) {
        console.error('Errore nella creazione conversazione:', result.error);
        return null;
      }
      
      if (result.chat) {
        return {
          id: result.chat.id,
          coach_id: result.chat.coach_id,
          client_id: result.chat.client_id,
          last_message_at: result.chat.last_message_at,
          created_at: result.chat.created_at,
          participants: result.chat.participants,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Errore nella creazione della conversazione:', error);
      return null;
    }
  }

  // Ottieni i coach disponibili
  static async getAvailableCoaches(): Promise<User[]> {
    try {
      const result = await supabaseChatService.getAvailableCoaches();
      
      if (result.error) {
        console.error('Errore nel recupero coach:', result.error);
        return [];
      }
      
      return result.coaches;
    } catch (error) {
      console.error('Errore nel recupero dei coach:', error);
      return [];
    }
  }

  // Segna i messaggi come letti
  static async markMessagesAsRead(chatId: string, userId: string): Promise<boolean> {
    try {
      const result = await supabaseChatService.markMessagesAsRead(chatId, userId);
      
      if (result.error) {
        console.error('Errore nel marcare messaggi come letti:', result.error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Errore nel marcare messaggi come letti:', error);
      return false;
    }
  }

  // Sottoscrizione real-time per i messaggi
  static subscribeToMessages(chatId: string, onMessage: (message: Message) => void, onError?: (error: any) => void) {
    return supabaseChatService.subscribeToMessages(chatId, (supabaseMessage) => {
      // Converti SupabaseMessage in Message
      const message: Message = {
        id: supabaseMessage.id,
        chat_id: supabaseMessage.chat_id,
        sender_id: supabaseMessage.sender_id,
        content: supabaseMessage.content,
        message_type: supabaseMessage.message_type,
        media_url: supabaseMessage.media_url,
        is_read: supabaseMessage.is_read,
        created_at: supabaseMessage.created_at,
        sender: supabaseMessage.sender,
      };
      onMessage(message);
    }, onError);
  }

  // Sottoscrizione real-time per le conversazioni
  static subscribeToConversations(userId: string, onConversationUpdate: (conversation: Chat) => void, onError?: (error: any) => void) {
    return supabaseChatService.subscribeToConversations(userId, (supabaseChat) => {
      // Converti SupabaseChat in Chat
      const chat: Chat = {
        id: supabaseChat.id,
        coach_id: supabaseChat.coach_id,
        client_id: supabaseChat.client_id,
        last_message_at: supabaseChat.last_message_at,
        created_at: supabaseChat.created_at,
        participants: supabaseChat.participants,
      };
      onConversationUpdate(chat);
    }, onError);
  }

  // Disiscriviti dai messaggi
  static unsubscribeFromMessages(chatId: string) {
    supabaseChatService.unsubscribeFromMessages(chatId);
  }

  // Disiscriviti da tutte le sottoscrizioni
  static unsubscribeFromAll() {
    supabaseChatService.unsubscribeFromAll();
  }
}
