import { supabase } from './supabase';
import { Chat, Message, User } from '@/types';

export interface SupabaseChat {
  id: string;
  coach_id: string;
  client_id: string;
  last_message_at: string;
  created_at: string;
  participants: User[];
}

export interface SupabaseMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'video';
  media_url?: string;
  is_read: boolean;
  created_at: string;
  sender: User;
}

class SupabaseChatService {
  private subscriptions: Map<string, any> = new Map();

  // Ottieni tutte le conversazioni dell'utente
  async getConversations(userId: string): Promise<{ conversations: SupabaseChat[]; error?: string }> {
    try {
      // Ottieni le chat dove l'utente è coach o client
      const { data: chats, error } = await supabase
        .from('chats')
        .select(`
          *,
          coach:profiles!chats_coach_id_fkey(id, email, name, role),
          client:profiles!chats_client_id_fkey(id, email, name, role)
        `)
        .or(`coach_id.eq.${userId},client_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Errore nel recupero conversazioni:', error);
        return { conversations: [], error: error.message };
      }

      const conversations: SupabaseChat[] = chats.map(chat => ({
        id: chat.id,
        coach_id: chat.coach_id,
        client_id: chat.client_id,
        last_message_at: chat.last_message_at,
        created_at: chat.created_at,
        participants: [
          {
            id: chat.coach.id,
            email: chat.coach.email,
            name: chat.coach.name,
            role: chat.coach.role,
            created_at: chat.coach.created_at,
            updated_at: chat.coach.updated_at,
          },
          {
            id: chat.client.id,
            email: chat.client.email,
            name: chat.client.name,
            role: chat.client.role,
            created_at: chat.client.created_at,
            updated_at: chat.client.updated_at,
          }
        ]
      }));

      return { conversations };
    } catch (error) {
      console.error('Errore nel recupero conversazioni:', error);
      return { conversations: [], error: 'Errore nel recupero conversazioni' };
    }
  }

  // Ottieni i messaggi di una conversazione
  async getMessages(chatId: string): Promise<{ messages: SupabaseMessage[]; error?: string }> {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, email, name, role, created_at, updated_at)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Errore nel recupero messaggi:', error);
        return { messages: [], error: error.message };
      }

      const supabaseMessages: SupabaseMessage[] = messages.map(message => ({
        id: message.id,
        chat_id: message.chat_id,
        sender_id: message.sender_id,
        content: message.content,
        message_type: message.message_type,
        media_url: message.media_url,
        is_read: message.is_read,
        created_at: message.created_at,
        sender: {
          id: message.sender.id,
          email: message.sender.email,
          name: message.sender.name,
          role: message.sender.role,
          created_at: message.sender.created_at,
          updated_at: message.sender.updated_at,
        }
      }));

      return { messages: supabaseMessages };
    } catch (error) {
      console.error('Errore nel recupero messaggi:', error);
      return { messages: [], error: 'Errore nel recupero messaggi' };
    }
  }

  // Invia un messaggio
  async sendMessage(chatId: string, senderId: string, content: string, messageType: 'text' | 'image' | 'video' = 'text', mediaUrl?: string): Promise<{ message?: SupabaseMessage; error?: string }> {
    try {
      const { data: message, error } = await supabase
        .from('messages')
        .insert([
          {
            chat_id: chatId,
            sender_id: senderId,
            content,
            message_type: messageType,
            media_url: mediaUrl,
            is_read: false,
            created_at: new Date().toISOString(),
          }
        ])
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, email, name, role, created_at, updated_at)
        `)
        .single();

      if (error) {
        console.error('Errore nell\'invio messaggio:', error);
        return { error: error.message };
      }

      // Aggiorna last_message_at della chat
      await supabase
        .from('chats')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', chatId);

      const supabaseMessage: SupabaseMessage = {
        id: message.id,
        chat_id: message.chat_id,
        sender_id: message.sender_id,
        content: message.content,
        message_type: message.message_type,
        media_url: message.media_url,
        is_read: message.is_read,
        created_at: message.created_at,
        sender: {
          id: message.sender.id,
          email: message.sender.email,
          name: message.sender.name,
          role: message.sender.role,
          created_at: message.sender.created_at,
          updated_at: message.sender.updated_at,
        }
      };

      return { message: supabaseMessage };
    } catch (error) {
      console.error('Errore nell\'invio messaggio:', error);
      return { error: 'Errore nell\'invio messaggio' };
    }
  }

  // Crea una nuova conversazione
  async createConversation(coachId: string, clientId: string): Promise<{ chat?: SupabaseChat; error?: string }> {
    try {
      // Verifica se esiste già una conversazione tra questi utenti
      const { data: existingChat } = await supabase
        .from('chats')
        .select('*')
        .or(`and(coach_id.eq.${coachId},client_id.eq.${clientId}),and(coach_id.eq.${clientId},client_id.eq.${coachId})`)
        .single();

      if (existingChat) {
        console.log('✅ Conversazione esistente trovata');
        return { chat: existingChat as SupabaseChat };
      }

      // Crea una nuova conversazione
      const { data: chat, error } = await supabase
        .from('chats')
        .insert([
          {
            coach_id: coachId,
            client_id: clientId,
            last_message_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          }
        ])
        .select(`
          *,
          coach:profiles!chats_coach_id_fkey(id, email, name, role),
          client:profiles!chats_client_id_fkey(id, email, name, role)
        `)
        .single();

      if (error) {
        console.error('Errore nella creazione conversazione:', error);
        return { error: error.message };
      }

      const supabaseChat: SupabaseChat = {
        id: chat.id,
        coach_id: chat.coach_id,
        client_id: chat.client_id,
        last_message_at: chat.last_message_at,
        created_at: chat.created_at,
        participants: [
          {
            id: chat.coach.id,
            email: chat.coach.email,
            name: chat.coach.name,
            role: chat.coach.role,
            created_at: chat.coach.created_at,
            updated_at: chat.coach.updated_at,
          },
          {
            id: chat.client.id,
            email: chat.client.email,
            name: chat.client.name,
            role: chat.client.role,
            created_at: chat.client.created_at,
            updated_at: chat.client.updated_at,
          }
        ]
      };

      return { chat: supabaseChat };
    } catch (error) {
      console.error('Errore nella creazione conversazione:', error);
      return { error: 'Errore nella creazione conversazione' };
    }
  }

  // Sottoscrizione real-time per i messaggi di una chat
  subscribeToMessages(chatId: string, onMessage: (message: SupabaseMessage) => void, onError?: (error: any) => void) {
    // Disiscriviti se esiste già una sottoscrizione per questa chat
    this.unsubscribeFromMessages(chatId);

    const subscription = supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          console.log('Nuovo messaggio ricevuto:', payload);
          if (payload.new) {
            // Ottieni i dettagli del mittente
            this.getMessageWithSender(payload.new.id).then(({ message }) => {
              if (message) {
                onMessage(message);
              }
            });
          }
        }
      )
      .on('error', (error) => {
        console.error('Errore nella sottoscrizione messaggi:', error);
        if (onError) onError(error);
      })
      .subscribe();

    this.subscriptions.set(chatId, subscription);
    return subscription;
  }

  // Sottoscrizione real-time per le conversazioni
  subscribeToConversations(userId: string, onConversationUpdate: (conversation: SupabaseChat) => void, onError?: (error: any) => void) {
    const subscription = supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `or(coach_id.eq.${userId},client_id.eq.${userId})`,
        },
        async (payload) => {
          console.log('Aggiornamento conversazione:', payload);
          if (payload.new) {
            // Ottieni i dettagli aggiornati della conversazione
            const { conversations } = await this.getConversations(userId);
            const updatedConversation = conversations.find(c => c.id === payload.new.id);
            if (updatedConversation) {
              onConversationUpdate(updatedConversation);
            }
          }
        }
      )
      .on('error', (error) => {
        console.error('Errore nella sottoscrizione conversazioni:', error);
        if (onError) onError(error);
      })
      .subscribe();

    this.subscriptions.set(`conversations:${userId}`, subscription);
    return subscription;
  }

  // Disiscriviti dai messaggi di una chat
  unsubscribeFromMessages(chatId: string) {
    const subscription = this.subscriptions.get(chatId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(chatId);
    }
  }

  // Disiscriviti da tutte le sottoscrizioni
  unsubscribeFromAll() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  // Ottieni un messaggio con i dettagli del mittente
  private async getMessageWithSender(messageId: string): Promise<{ message?: SupabaseMessage; error?: string }> {
    try {
      const { data: message, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, email, name, role, created_at, updated_at)
        `)
        .eq('id', messageId)
        .single();

      if (error) {
        return { error: error.message };
      }

      const supabaseMessage: SupabaseMessage = {
        id: message.id,
        chat_id: message.chat_id,
        sender_id: message.sender_id,
        content: message.content,
        message_type: message.message_type,
        media_url: message.media_url,
        is_read: message.is_read,
        created_at: message.created_at,
        sender: {
          id: message.sender.id,
          email: message.sender.email,
          name: message.sender.name,
          role: message.sender.role,
          created_at: message.sender.created_at,
          updated_at: message.sender.updated_at,
        }
      };

      return { message: supabaseMessage };
    } catch (error) {
      return { error: 'Errore nel recupero messaggio' };
    }
  }

  // Ottieni i coach disponibili
  async getAvailableCoaches(): Promise<{ coaches: User[]; error?: string }> {
    try {
      const { data: coaches, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'coach')
        .order('name');

      if (error) {
        console.error('Errore nel recupero coach:', error);
        return { coaches: [], error: error.message };
      }

      const users: User[] = coaches.map(coach => ({
        id: coach.id,
        email: coach.email,
        name: coach.name,
        role: coach.role,
        created_at: coach.created_at,
        updated_at: coach.updated_at,
      }));

      return { coaches: users };
    } catch (error) {
      console.error('Errore nel recupero coach:', error);
      return { coaches: [], error: 'Errore nel recupero coach' };
    }
  }

  // Segna i messaggi come letti
  async markMessagesAsRead(chatId: string, userId: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .neq('sender_id', userId);

      if (error) {
        console.error('Errore nel marcare messaggi come letti:', error);
        return { error: error.message };
      }

      return {};
    } catch (error) {
      console.error('Errore nel marcare messaggi come letti:', error);
      return { error: 'Errore nel marcare messaggi come letti' };
    }
  }
}

export const supabaseChatService = new SupabaseChatService();
